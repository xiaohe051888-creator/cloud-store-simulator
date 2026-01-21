import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { readFile } from 'fs/promises';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function POST(request: NextRequest) {
  try {
    // 读取本地打包文件
    const fileBuffer = await readFile('/tmp/cloudshop-simulator-v1.4.6.tar.gz');
    
    // 上传到对象存储
    const fileName = `cloudshop-simulator-v1.4.6-${Date.now()}.tar.gz`;
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: fileName,
      contentType: 'application/gzip',
    });
    
    // 生成下载链接（有效期7天）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天 = 604800秒
    });
    
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: 'cloudshop-simulator-v1.4.6.tar.gz',
      version: '1.4.6',
    });
  } catch (error) {
    console.error('上传失败:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}
