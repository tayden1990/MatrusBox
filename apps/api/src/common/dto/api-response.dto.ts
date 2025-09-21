import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data containing user and tokens',
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123-uuid-456' },
          email: { type: 'string', example: 'user@example.com' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      refreshToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      createdAt: Date;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data (structure varies by endpoint)',
  })
  data: T;

  @ApiProperty({
    description: 'Optional metadata for paginated responses',
    required: false,
    type: 'object',
  })
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message: string;
}
