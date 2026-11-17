import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

let s3ClientInstance = null;

export const getStorageConfig = () => {
  const provider = (process.env.STORAGE_PROVIDER || (process.env.R2_ACCOUNT_ID ? 'r2' : 's3')).toLowerCase();

  const isR2 = provider === 'r2' || Boolean(process.env.R2_ACCOUNT_ID);

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || (isR2 ? 'auto' : 'us-east-1');
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.AWS_PUBLIC_URL || process.env.S3_PUBLIC_URL;

  let endpoint = process.env.S3_ENDPOINT;
  if (!endpoint && isR2 && accountId) {
    endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  }

  const isConfigured = Boolean(accessKeyId && secretAccessKey && bucket);

  return {
    provider: isR2 ? 'r2' : 's3',
    isConfigured,
    accessKeyId,
    secretAccessKey,
    bucket,
    region,
    endpoint,
    publicUrl: publicUrl ? publicUrl.replace(/\/+$/, '') : null
  };
};

export const getS3Client = () => {
  const config = getStorageConfig();
  if (!config.isConfigured) return null;

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: config.region,
      endpoint: config.endpoint || undefined,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: Boolean(config.endpoint && !config.endpoint.includes('amazonaws.com')),
    });
  }

  return s3ClientInstance;
};

export const isCloudStorageConfigured = () => {
  const config = getStorageConfig();
  return config.isConfigured;
};

/**
 * Generate a presigned PUT URL for direct client-to-cloud upload.
 * Supports files up to 5GB per movie.
 */
export const createPresignedUploadUrl = async ({ filename, contentType = 'video/mp4' }) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage (R2/S3) is not configured.');
  }

  const ext = path.extname(filename || 'movie.mp4').toLowerCase() || '.mp4';
  const cleanBase = path.basename(filename || 'movie', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `movies/${Date.now()}-${uuidv4().substring(0, 8)}-${cleanBase}${ext}`;

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  // Valid for 2 hours to allow large movie uploads
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 7200 });

  // Stream URL: /api/movies/stream/cloud/:key routes through server to obtain secure signed URL
  const streamUrl = `/api/movies/stream/cloud/${encodeURIComponent(key)}`;

  return {
    uploadUrl,
    key,
    bucket: config.bucket,
    streamUrl,
    contentType,
    provider: config.provider,
    isPublic: Boolean(config.publicUrl)
  };
};

// ----------------------------------------------------
// MULTIPART / RESUMABLE CLOUD UPLOAD SUPPORT
// ----------------------------------------------------

/**
 * Initiate multipart upload for huge files (up to multi-terabyte)
 */
export const initiateMultipartUpload = async ({ filename, contentType = 'video/mp4' }) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage (R2/S3) is not configured.');
  }

  const ext = path.extname(filename || 'movie.mp4').toLowerCase() || '.mp4';
  const cleanBase = path.basename(filename || 'movie', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `movies/${Date.now()}-${uuidv4().substring(0, 8)}-${cleanBase}${ext}`;

  const command = new CreateMultipartUploadCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const response = await client.send(command);
  const streamUrl = `/api/movies/stream/cloud/${encodeURIComponent(key)}`;

  return {
    uploadId: response.UploadId,
    key,
    streamUrl,
    bucket: config.bucket,
  };
};

/**
 * Get presigned upload URL for a specific multipart chunk
 */
export const getMultipartPartUploadUrl = async ({ key, uploadId, partNumber }) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage (R2/S3) is not configured.');
  }

  const command = new UploadPartCommand({
    Bucket: config.bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: Number(partNumber),
  });

  const partUploadUrl = await getSignedUrl(client, command, { expiresIn: 7200 });
  return { partUploadUrl, partNumber: Number(partNumber) };
};

/**
 * Complete multipart upload by combining all uploaded parts
 */
export const completeMultipartUpload = async ({ key, uploadId, parts }) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage (R2/S3) is not configured.');
  }

  // Sort parts by PartNumber ascending (required by S3/R2 specification)
  const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);

  const command = new CompleteMultipartUploadCommand({
    Bucket: config.bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: sortedParts.map(p => ({
        ETag: p.ETag,
        PartNumber: Number(p.PartNumber)
      }))
    }
  });

  const response = await client.send(command);
  const streamUrl = `/api/movies/stream/cloud/${encodeURIComponent(key)}`;

  return {
    location: response.Location,
    key,
    streamUrl
  };
};

/**
 * Abort multipart upload to clean up aborted chunks
 */
export const abortMultipartUpload = async ({ key, uploadId }) => {
  const client = getS3Client();
  const config = getStorageConfig();
  if (!client || !config.isConfigured) return false;

  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: config.bucket,
      Key: key,
      UploadId: uploadId
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.warn('Abort multipart upload error:', err.message);
    return false;
  }
};

// ----------------------------------------------------
// SECURE SIGNED URL FOR PLAYBACK
// ----------------------------------------------------

/**
 * Generate a secure signed GET URL for movie playback (6 hours validity)
 * Works for both private Cloudflare R2 and private AWS S3 buckets.
 */
export const createPresignedDownloadUrl = async (key, expiresIn = 21600) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage (R2/S3) is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
};

/**
 * Stream an object directly from cloud storage with HTTP 206 Range support.
 */
export const getCloudObjectStream = async (key, rangeHeader = null) => {
  const client = getS3Client();
  const config = getStorageConfig();

  if (!client || !config.isConfigured) {
    throw new Error('Cloud storage is not configured.');
  }

  const commandInput = {
    Bucket: config.bucket,
    Key: key,
  };

  if (rangeHeader) {
    commandInput.Range = rangeHeader;
  }

  const command = new GetObjectCommand(commandInput);
  const response = await client.send(command);

  return {
    body: response.Body,
    contentLength: response.ContentLength,
    contentType: response.ContentType || 'video/mp4',
    contentRange: response.ContentRange,
    acceptRanges: response.AcceptRanges || 'bytes',
    statusCode: response.ContentRange ? 206 : 200,
  };
};

/**
 * Delete an object from cloud storage
 */
export const deleteCloudObject = async (key) => {
  const client = getS3Client();
  const config = getStorageConfig();
  if (!client || !config.isConfigured) return false;

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.warn('Failed to delete cloud object:', err.message);
    return false;
  }
};
