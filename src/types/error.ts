export interface CustomError extends Error {
  status?: number;
  code?: string;
  meta?: Record<string, unknown>;
}

export interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}
