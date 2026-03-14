import sharp from 'sharp';

export const resizeImage = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(600, 600, {
      fit: 'inside',
    })
    .toBuffer();
};
