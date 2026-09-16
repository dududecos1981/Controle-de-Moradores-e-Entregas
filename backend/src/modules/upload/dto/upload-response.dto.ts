import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'http://localhost:3000/uploads/visitantes/foto_1694827100_a1b2c3.webp' })
  url: string;

  @ApiProperty({ example: 'foto_1694827100_a1b2c3.webp' })
  filename: string;

  @ApiProperty({ example: 'image/webp' })
  mimeType: string;

  @ApiProperty({ example: 45200 })
  sizeBytes: number;

  @ApiProperty({ example: 1200 })
  width: number;

  @ApiProperty({ example: 800 })
  height: number;

  @ApiProperty({ example: 'local', enum: ['local', 's3'] })
  driver: 'local' | 's3';
}
