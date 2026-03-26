import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import {
  DomainException,
  NotFoundException,
  ConflictException,
  ValidationException,
} from '../../domain/exceptions';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map NotFoundException to HTTP 404', () => {
    const exception = new NotFoundException('User not found');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'NotFoundException',
    });
  });

  it('should map ConflictException to HTTP 409', () => {
    const exception = new ConflictException('Email already exists');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Email already exists',
      error: 'ConflictException',
    });
  });

  it('should map ValidationException to HTTP 400', () => {
    const exception = new ValidationException('Invalid email format');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid email format',
      error: 'ValidationException',
    });
  });

  it('should map unknown DomainException to HTTP 500', () => {
    const exception = new DomainException('Something went wrong');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
      error: 'DomainException',
    });
  });

  it('should return correct response shape', () => {
    const exception = new NotFoundException('Not found');

    filter.catch(exception, mockHost);

    const jsonCall = mockResponse.json.mock.calls[0][0];
    expect(jsonCall).toHaveProperty('statusCode');
    expect(jsonCall).toHaveProperty('message');
    expect(jsonCall).toHaveProperty('error');
    expect(Object.keys(jsonCall)).toHaveLength(3);
  });
});
