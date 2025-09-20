export abstract class BaseRepository<
  T,
  CreateDto = Partial<T>,
  UpdateDto = Partial<T>,
> {
  abstract save(data: CreateDto): Promise<T>;
  abstract update(data: UpdateDto): Promise<T | null>;
  abstract findMany(query: Record<string, any>): Promise<T[]>;
  abstract findOne(query: Record<string, any>): Promise<T | null>;
  abstract remove(query: Record<string, any>): Promise<T | null>;
  abstract removeMany(query: Record<string, any>): Promise<void>;
}
