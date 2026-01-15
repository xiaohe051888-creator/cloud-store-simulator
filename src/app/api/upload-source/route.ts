import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import fs from 'fs/promises';
import path from 'path';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function GET() {
  try {
    // 读取 zip 文件
    const zipFilePath = '/tmp/cloud-shop-simulator.zip';
    const fileContent = await fs.readFile(zipFilePath);

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: Buffer.from(fileContent),
      fileName: 'cloud-shop-simulator.zip',
      contentType: 'application/zip',
    });

    // 生成签名 URL（有效期 7 天）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7 天 = 7 * 24 * 60 * 60
    });

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileKey,
      size: fileContent.length,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
