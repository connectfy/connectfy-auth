export abstract class BaseRepository<
  T,
  CreateDto = Partial<T>,
  UpdateDto = Partial<T>,
> {
  abstract create(data: CreateDto): Promise<T>;
  abstract update(data: UpdateDto): Promise<T | null>;
  abstract remove(id: string): Promise<T | null>;
  abstract findOne?(query: Record<string, any>): Promise<T | null>;
  abstract findMany?(query: Record<string, any>): Promise<T[]>;
  abstract count(query: Record<string, any>): Promise<number>;
  abstract existsByField(query: Record<string,any>): Promise<boolean>;
}
