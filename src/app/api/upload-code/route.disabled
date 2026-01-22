import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';
import path from 'path';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function POST() {
  try {
    // 读取压缩文件
    const filePath = path.join(process.cwd(), 'public', 'cloud-shop-simulator-v1.4.5.tar.gz');
    const fileBuffer = await readFile(filePath);

    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: 'cloud-shop-simulator-v1.4.5.tar.gz',
      contentType: 'application/gzip',
    });

    // 生成30天有效期的签名下载链接
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 2592000, // 30天
    });

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: 'cloud-shop-simulator-v1.4.5.tar.gz',
      fileSize: '731 KB',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}
