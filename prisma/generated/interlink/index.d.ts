
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model category
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type category = $Result.DefaultSelection<Prisma.$categoryPayload>
/**
 * Model more_pictures
 * 
 */
export type more_pictures = $Result.DefaultSelection<Prisma.$more_picturesPayload>
/**
 * Model part
 * 
 */
export type part = $Result.DefaultSelection<Prisma.$partPayload>
/**
 * Model product
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type product = $Result.DefaultSelection<Prisma.$productPayload>
/**
 * Model sub
 * 
 */
export type sub = $Result.DefaultSelection<Prisma.$subPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Categories
 * const categories = await prisma.category.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.category`: Exposes CRUD operations for the **category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.categoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.more_pictures`: Exposes CRUD operations for the **more_pictures** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more More_pictures
    * const more_pictures = await prisma.more_pictures.findMany()
    * ```
    */
  get more_pictures(): Prisma.more_picturesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.part`: Exposes CRUD operations for the **part** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Parts
    * const parts = await prisma.part.findMany()
    * ```
    */
  get part(): Prisma.partDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.productDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sub`: Exposes CRUD operations for the **sub** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Subs
    * const subs = await prisma.sub.findMany()
    * ```
    */
  get sub(): Prisma.subDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    category: 'category',
    more_pictures: 'more_pictures',
    part: 'part',
    product: 'product',
    sub: 'sub'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "category" | "more_pictures" | "part" | "product" | "sub"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      category: {
        payload: Prisma.$categoryPayload<ExtArgs>
        fields: Prisma.categoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.categoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.categoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          findFirst: {
            args: Prisma.categoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.categoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          findMany: {
            args: Prisma.categoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>[]
          }
          create: {
            args: Prisma.categoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          createMany: {
            args: Prisma.categoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.categoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          update: {
            args: Prisma.categoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          deleteMany: {
            args: Prisma.categoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.categoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.categoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$categoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.categoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.categoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      more_pictures: {
        payload: Prisma.$more_picturesPayload<ExtArgs>
        fields: Prisma.more_picturesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.more_picturesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.more_picturesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          findFirst: {
            args: Prisma.more_picturesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.more_picturesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          findMany: {
            args: Prisma.more_picturesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>[]
          }
          create: {
            args: Prisma.more_picturesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          createMany: {
            args: Prisma.more_picturesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.more_picturesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          update: {
            args: Prisma.more_picturesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          deleteMany: {
            args: Prisma.more_picturesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.more_picturesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.more_picturesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_picturesPayload>
          }
          aggregate: {
            args: Prisma.More_picturesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMore_pictures>
          }
          groupBy: {
            args: Prisma.more_picturesGroupByArgs<ExtArgs>
            result: $Utils.Optional<More_picturesGroupByOutputType>[]
          }
          count: {
            args: Prisma.more_picturesCountArgs<ExtArgs>
            result: $Utils.Optional<More_picturesCountAggregateOutputType> | number
          }
        }
      }
      part: {
        payload: Prisma.$partPayload<ExtArgs>
        fields: Prisma.partFieldRefs
        operations: {
          findUnique: {
            args: Prisma.partFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.partFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          findFirst: {
            args: Prisma.partFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.partFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          findMany: {
            args: Prisma.partFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>[]
          }
          create: {
            args: Prisma.partCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          createMany: {
            args: Prisma.partCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.partDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          update: {
            args: Prisma.partUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          deleteMany: {
            args: Prisma.partDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.partUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.partUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$partPayload>
          }
          aggregate: {
            args: Prisma.PartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePart>
          }
          groupBy: {
            args: Prisma.partGroupByArgs<ExtArgs>
            result: $Utils.Optional<PartGroupByOutputType>[]
          }
          count: {
            args: Prisma.partCountArgs<ExtArgs>
            result: $Utils.Optional<PartCountAggregateOutputType> | number
          }
        }
      }
      product: {
        payload: Prisma.$productPayload<ExtArgs>
        fields: Prisma.productFieldRefs
        operations: {
          findUnique: {
            args: Prisma.productFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.productFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          findFirst: {
            args: Prisma.productFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.productFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          findMany: {
            args: Prisma.productFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>[]
          }
          create: {
            args: Prisma.productCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          createMany: {
            args: Prisma.productCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.productDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          update: {
            args: Prisma.productUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          deleteMany: {
            args: Prisma.productDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.productUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.productUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$productPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.productGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.productCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      sub: {
        payload: Prisma.$subPayload<ExtArgs>
        fields: Prisma.subFieldRefs
        operations: {
          findUnique: {
            args: Prisma.subFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.subFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          findFirst: {
            args: Prisma.subFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.subFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          findMany: {
            args: Prisma.subFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>[]
          }
          create: {
            args: Prisma.subCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          createMany: {
            args: Prisma.subCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.subDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          update: {
            args: Prisma.subUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          deleteMany: {
            args: Prisma.subDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.subUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.subUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$subPayload>
          }
          aggregate: {
            args: Prisma.SubAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSub>
          }
          groupBy: {
            args: Prisma.subGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubGroupByOutputType>[]
          }
          count: {
            args: Prisma.subCountArgs<ExtArgs>
            result: $Utils.Optional<SubCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    category?: categoryOmit
    more_pictures?: more_picturesOmit
    part?: partOmit
    product?: productOmit
    sub?: subOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    category_id: number | null
    category_number: number | null
    category_status: number | null
    users_action: number | null
  }

  export type CategorySumAggregateOutputType = {
    category_id: number | null
    category_number: number | null
    category_status: number | null
    users_action: number | null
  }

  export type CategoryMinAggregateOutputType = {
    category_id: number | null
    category_name: string | null
    category_number: number | null
    category_keyword: string | null
    category_title: string | null
    category_description: string | null
    category_color: string | null
    category_picture: string | null
    category_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    category_id: number | null
    category_name: string | null
    category_number: number | null
    category_keyword: string | null
    category_title: string | null
    category_description: string | null
    category_color: string | null
    category_picture: string | null
    category_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    category_id: number
    category_name: number
    category_number: number
    category_keyword: number
    category_title: number
    category_description: number
    category_color: number
    category_picture: number
    category_status: number
    users_action: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    category_id?: true
    category_number?: true
    category_status?: true
    users_action?: true
  }

  export type CategorySumAggregateInputType = {
    category_id?: true
    category_number?: true
    category_status?: true
    users_action?: true
  }

  export type CategoryMinAggregateInputType = {
    category_id?: true
    category_name?: true
    category_number?: true
    category_keyword?: true
    category_title?: true
    category_description?: true
    category_color?: true
    category_picture?: true
    category_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type CategoryMaxAggregateInputType = {
    category_id?: true
    category_name?: true
    category_number?: true
    category_keyword?: true
    category_title?: true
    category_description?: true
    category_color?: true
    category_picture?: true
    category_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type CategoryCountAggregateInputType = {
    category_id?: true
    category_name?: true
    category_number?: true
    category_keyword?: true
    category_title?: true
    category_description?: true
    category_color?: true
    category_picture?: true
    category_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which category to aggregate.
     */
    where?: categoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of categories to fetch.
     */
    orderBy?: categoryOrderByWithRelationInput | categoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: categoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type categoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: categoryWhereInput
    orderBy?: categoryOrderByWithAggregationInput | categoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: categoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    category_id: number
    category_name: string
    category_number: number
    category_keyword: string | null
    category_title: string | null
    category_description: string | null
    category_color: string | null
    category_picture: string | null
    category_status: number
    users_action: number
    created_at: Date
    updated_at: Date
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends categoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type categorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    category_id?: boolean
    category_name?: boolean
    category_number?: boolean
    category_keyword?: boolean
    category_title?: boolean
    category_description?: boolean
    category_color?: boolean
    category_picture?: boolean
    category_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["category"]>



  export type categorySelectScalar = {
    category_id?: boolean
    category_name?: boolean
    category_number?: boolean
    category_keyword?: boolean
    category_title?: boolean
    category_description?: boolean
    category_color?: boolean
    category_picture?: boolean
    category_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type categoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"category_id" | "category_name" | "category_number" | "category_keyword" | "category_title" | "category_description" | "category_color" | "category_picture" | "category_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["category"]>

  export type $categoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "category"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      category_id: number
      category_name: string
      category_number: number
      category_keyword: string | null
      category_title: string | null
      category_description: string | null
      category_color: string | null
      category_picture: string | null
      category_status: number
      users_action: number
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type categoryGetPayload<S extends boolean | null | undefined | categoryDefaultArgs> = $Result.GetResult<Prisma.$categoryPayload, S>

  type categoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<categoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface categoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['category'], meta: { name: 'category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {categoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends categoryFindUniqueArgs>(args: SelectSubset<T, categoryFindUniqueArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {categoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends categoryFindUniqueOrThrowArgs>(args: SelectSubset<T, categoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends categoryFindFirstArgs>(args?: SelectSubset<T, categoryFindFirstArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends categoryFindFirstOrThrowArgs>(args?: SelectSubset<T, categoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `category_id`
     * const categoryWithCategory_idOnly = await prisma.category.findMany({ select: { category_id: true } })
     * 
     */
    findMany<T extends categoryFindManyArgs>(args?: SelectSubset<T, categoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {categoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends categoryCreateArgs>(args: SelectSubset<T, categoryCreateArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {categoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends categoryCreateManyArgs>(args?: SelectSubset<T, categoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Category.
     * @param {categoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends categoryDeleteArgs>(args: SelectSubset<T, categoryDeleteArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {categoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends categoryUpdateArgs>(args: SelectSubset<T, categoryUpdateArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {categoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends categoryDeleteManyArgs>(args?: SelectSubset<T, categoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends categoryUpdateManyArgs>(args: SelectSubset<T, categoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Category.
     * @param {categoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends categoryUpsertArgs>(args: SelectSubset<T, categoryUpsertArgs<ExtArgs>>): Prisma__categoryClient<$Result.GetResult<Prisma.$categoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends categoryCountArgs>(
      args?: Subset<T, categoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {categoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends categoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: categoryGroupByArgs['orderBy'] }
        : { orderBy?: categoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, categoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the category model
   */
  readonly fields: categoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__categoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the category model
   */
  interface categoryFieldRefs {
    readonly category_id: FieldRef<"category", 'Int'>
    readonly category_name: FieldRef<"category", 'String'>
    readonly category_number: FieldRef<"category", 'Int'>
    readonly category_keyword: FieldRef<"category", 'String'>
    readonly category_title: FieldRef<"category", 'String'>
    readonly category_description: FieldRef<"category", 'String'>
    readonly category_color: FieldRef<"category", 'String'>
    readonly category_picture: FieldRef<"category", 'String'>
    readonly category_status: FieldRef<"category", 'Int'>
    readonly users_action: FieldRef<"category", 'Int'>
    readonly created_at: FieldRef<"category", 'DateTime'>
    readonly updated_at: FieldRef<"category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * category findUnique
   */
  export type categoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter, which category to fetch.
     */
    where: categoryWhereUniqueInput
  }

  /**
   * category findUniqueOrThrow
   */
  export type categoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter, which category to fetch.
     */
    where: categoryWhereUniqueInput
  }

  /**
   * category findFirst
   */
  export type categoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter, which category to fetch.
     */
    where?: categoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of categories to fetch.
     */
    orderBy?: categoryOrderByWithRelationInput | categoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for categories.
     */
    cursor?: categoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * category findFirstOrThrow
   */
  export type categoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter, which category to fetch.
     */
    where?: categoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of categories to fetch.
     */
    orderBy?: categoryOrderByWithRelationInput | categoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for categories.
     */
    cursor?: categoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * category findMany
   */
  export type categoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter, which categories to fetch.
     */
    where?: categoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of categories to fetch.
     */
    orderBy?: categoryOrderByWithRelationInput | categoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing categories.
     */
    cursor?: categoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * category create
   */
  export type categoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * The data needed to create a category.
     */
    data: XOR<categoryCreateInput, categoryUncheckedCreateInput>
  }

  /**
   * category createMany
   */
  export type categoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many categories.
     */
    data: categoryCreateManyInput | categoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * category update
   */
  export type categoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * The data needed to update a category.
     */
    data: XOR<categoryUpdateInput, categoryUncheckedUpdateInput>
    /**
     * Choose, which category to update.
     */
    where: categoryWhereUniqueInput
  }

  /**
   * category updateMany
   */
  export type categoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update categories.
     */
    data: XOR<categoryUpdateManyMutationInput, categoryUncheckedUpdateManyInput>
    /**
     * Filter which categories to update
     */
    where?: categoryWhereInput
    /**
     * Limit how many categories to update.
     */
    limit?: number
  }

  /**
   * category upsert
   */
  export type categoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * The filter to search for the category to update in case it exists.
     */
    where: categoryWhereUniqueInput
    /**
     * In case the category found by the `where` argument doesn't exist, create a new category with this data.
     */
    create: XOR<categoryCreateInput, categoryUncheckedCreateInput>
    /**
     * In case the category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<categoryUpdateInput, categoryUncheckedUpdateInput>
  }

  /**
   * category delete
   */
  export type categoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
    /**
     * Filter which category to delete.
     */
    where: categoryWhereUniqueInput
  }

  /**
   * category deleteMany
   */
  export type categoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which categories to delete
     */
    where?: categoryWhereInput
    /**
     * Limit how many categories to delete.
     */
    limit?: number
  }

  /**
   * category without action
   */
  export type categoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category
     */
    select?: categorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the category
     */
    omit?: categoryOmit<ExtArgs> | null
  }


  /**
   * Model more_pictures
   */

  export type AggregateMore_pictures = {
    _count: More_picturesCountAggregateOutputType | null
    _avg: More_picturesAvgAggregateOutputType | null
    _sum: More_picturesSumAggregateOutputType | null
    _min: More_picturesMinAggregateOutputType | null
    _max: More_picturesMaxAggregateOutputType | null
  }

  export type More_picturesAvgAggregateOutputType = {
    mp_id: number | null
    product_id: number | null
  }

  export type More_picturesSumAggregateOutputType = {
    mp_id: bigint | null
    product_id: number | null
  }

  export type More_picturesMinAggregateOutputType = {
    mp_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_picturesMaxAggregateOutputType = {
    mp_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_picturesCountAggregateOutputType = {
    mp_id: number
    product_id: number
    product_picture: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type More_picturesAvgAggregateInputType = {
    mp_id?: true
    product_id?: true
  }

  export type More_picturesSumAggregateInputType = {
    mp_id?: true
    product_id?: true
  }

  export type More_picturesMinAggregateInputType = {
    mp_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_picturesMaxAggregateInputType = {
    mp_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_picturesCountAggregateInputType = {
    mp_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type More_picturesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures to aggregate.
     */
    where?: more_picturesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures to fetch.
     */
    orderBy?: more_picturesOrderByWithRelationInput | more_picturesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: more_picturesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned more_pictures
    **/
    _count?: true | More_picturesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: More_picturesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: More_picturesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: More_picturesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: More_picturesMaxAggregateInputType
  }

  export type GetMore_picturesAggregateType<T extends More_picturesAggregateArgs> = {
        [P in keyof T & keyof AggregateMore_pictures]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMore_pictures[P]>
      : GetScalarType<T[P], AggregateMore_pictures[P]>
  }




  export type more_picturesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: more_picturesWhereInput
    orderBy?: more_picturesOrderByWithAggregationInput | more_picturesOrderByWithAggregationInput[]
    by: More_picturesScalarFieldEnum[] | More_picturesScalarFieldEnum
    having?: more_picturesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: More_picturesCountAggregateInputType | true
    _avg?: More_picturesAvgAggregateInputType
    _sum?: More_picturesSumAggregateInputType
    _min?: More_picturesMinAggregateInputType
    _max?: More_picturesMaxAggregateInputType
  }

  export type More_picturesGroupByOutputType = {
    mp_id: bigint
    product_id: number
    product_picture: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: More_picturesCountAggregateOutputType | null
    _avg: More_picturesAvgAggregateOutputType | null
    _sum: More_picturesSumAggregateOutputType | null
    _min: More_picturesMinAggregateOutputType | null
    _max: More_picturesMaxAggregateOutputType | null
  }

  type GetMore_picturesGroupByPayload<T extends more_picturesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<More_picturesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof More_picturesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], More_picturesGroupByOutputType[P]>
            : GetScalarType<T[P], More_picturesGroupByOutputType[P]>
        }
      >
    >


  export type more_picturesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mp_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["more_pictures"]>



  export type more_picturesSelectScalar = {
    mp_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type more_picturesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"mp_id" | "product_id" | "product_picture" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["more_pictures"]>

  export type $more_picturesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "more_pictures"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      mp_id: bigint
      product_id: number
      product_picture: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["more_pictures"]>
    composites: {}
  }

  type more_picturesGetPayload<S extends boolean | null | undefined | more_picturesDefaultArgs> = $Result.GetResult<Prisma.$more_picturesPayload, S>

  type more_picturesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<more_picturesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: More_picturesCountAggregateInputType | true
    }

  export interface more_picturesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['more_pictures'], meta: { name: 'more_pictures' } }
    /**
     * Find zero or one More_pictures that matches the filter.
     * @param {more_picturesFindUniqueArgs} args - Arguments to find a More_pictures
     * @example
     * // Get one More_pictures
     * const more_pictures = await prisma.more_pictures.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends more_picturesFindUniqueArgs>(args: SelectSubset<T, more_picturesFindUniqueArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one More_pictures that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {more_picturesFindUniqueOrThrowArgs} args - Arguments to find a More_pictures
     * @example
     * // Get one More_pictures
     * const more_pictures = await prisma.more_pictures.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends more_picturesFindUniqueOrThrowArgs>(args: SelectSubset<T, more_picturesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesFindFirstArgs} args - Arguments to find a More_pictures
     * @example
     * // Get one More_pictures
     * const more_pictures = await prisma.more_pictures.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends more_picturesFindFirstArgs>(args?: SelectSubset<T, more_picturesFindFirstArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesFindFirstOrThrowArgs} args - Arguments to find a More_pictures
     * @example
     * // Get one More_pictures
     * const more_pictures = await prisma.more_pictures.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends more_picturesFindFirstOrThrowArgs>(args?: SelectSubset<T, more_picturesFindFirstOrThrowArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more More_pictures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all More_pictures
     * const more_pictures = await prisma.more_pictures.findMany()
     * 
     * // Get first 10 More_pictures
     * const more_pictures = await prisma.more_pictures.findMany({ take: 10 })
     * 
     * // Only select the `mp_id`
     * const more_picturesWithMp_idOnly = await prisma.more_pictures.findMany({ select: { mp_id: true } })
     * 
     */
    findMany<T extends more_picturesFindManyArgs>(args?: SelectSubset<T, more_picturesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a More_pictures.
     * @param {more_picturesCreateArgs} args - Arguments to create a More_pictures.
     * @example
     * // Create one More_pictures
     * const More_pictures = await prisma.more_pictures.create({
     *   data: {
     *     // ... data to create a More_pictures
     *   }
     * })
     * 
     */
    create<T extends more_picturesCreateArgs>(args: SelectSubset<T, more_picturesCreateArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many More_pictures.
     * @param {more_picturesCreateManyArgs} args - Arguments to create many More_pictures.
     * @example
     * // Create many More_pictures
     * const more_pictures = await prisma.more_pictures.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends more_picturesCreateManyArgs>(args?: SelectSubset<T, more_picturesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a More_pictures.
     * @param {more_picturesDeleteArgs} args - Arguments to delete one More_pictures.
     * @example
     * // Delete one More_pictures
     * const More_pictures = await prisma.more_pictures.delete({
     *   where: {
     *     // ... filter to delete one More_pictures
     *   }
     * })
     * 
     */
    delete<T extends more_picturesDeleteArgs>(args: SelectSubset<T, more_picturesDeleteArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one More_pictures.
     * @param {more_picturesUpdateArgs} args - Arguments to update one More_pictures.
     * @example
     * // Update one More_pictures
     * const more_pictures = await prisma.more_pictures.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends more_picturesUpdateArgs>(args: SelectSubset<T, more_picturesUpdateArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more More_pictures.
     * @param {more_picturesDeleteManyArgs} args - Arguments to filter More_pictures to delete.
     * @example
     * // Delete a few More_pictures
     * const { count } = await prisma.more_pictures.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends more_picturesDeleteManyArgs>(args?: SelectSubset<T, more_picturesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more More_pictures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many More_pictures
     * const more_pictures = await prisma.more_pictures.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends more_picturesUpdateManyArgs>(args: SelectSubset<T, more_picturesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one More_pictures.
     * @param {more_picturesUpsertArgs} args - Arguments to update or create a More_pictures.
     * @example
     * // Update or create a More_pictures
     * const more_pictures = await prisma.more_pictures.upsert({
     *   create: {
     *     // ... data to create a More_pictures
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the More_pictures we want to update
     *   }
     * })
     */
    upsert<T extends more_picturesUpsertArgs>(args: SelectSubset<T, more_picturesUpsertArgs<ExtArgs>>): Prisma__more_picturesClient<$Result.GetResult<Prisma.$more_picturesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of More_pictures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesCountArgs} args - Arguments to filter More_pictures to count.
     * @example
     * // Count the number of More_pictures
     * const count = await prisma.more_pictures.count({
     *   where: {
     *     // ... the filter for the More_pictures we want to count
     *   }
     * })
    **/
    count<T extends more_picturesCountArgs>(
      args?: Subset<T, more_picturesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], More_picturesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a More_pictures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {More_picturesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends More_picturesAggregateArgs>(args: Subset<T, More_picturesAggregateArgs>): Prisma.PrismaPromise<GetMore_picturesAggregateType<T>>

    /**
     * Group by More_pictures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_picturesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends more_picturesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: more_picturesGroupByArgs['orderBy'] }
        : { orderBy?: more_picturesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, more_picturesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMore_picturesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the more_pictures model
   */
  readonly fields: more_picturesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for more_pictures.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__more_picturesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the more_pictures model
   */
  interface more_picturesFieldRefs {
    readonly mp_id: FieldRef<"more_pictures", 'BigInt'>
    readonly product_id: FieldRef<"more_pictures", 'Int'>
    readonly product_picture: FieldRef<"more_pictures", 'String'>
    readonly create_date: FieldRef<"more_pictures", 'DateTime'>
    readonly create_name: FieldRef<"more_pictures", 'String'>
    readonly update_date: FieldRef<"more_pictures", 'DateTime'>
    readonly update_name: FieldRef<"more_pictures", 'String'>
  }
    

  // Custom InputTypes
  /**
   * more_pictures findUnique
   */
  export type more_picturesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures to fetch.
     */
    where: more_picturesWhereUniqueInput
  }

  /**
   * more_pictures findUniqueOrThrow
   */
  export type more_picturesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures to fetch.
     */
    where: more_picturesWhereUniqueInput
  }

  /**
   * more_pictures findFirst
   */
  export type more_picturesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures to fetch.
     */
    where?: more_picturesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures to fetch.
     */
    orderBy?: more_picturesOrderByWithRelationInput | more_picturesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures.
     */
    cursor?: more_picturesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures.
     */
    distinct?: More_picturesScalarFieldEnum | More_picturesScalarFieldEnum[]
  }

  /**
   * more_pictures findFirstOrThrow
   */
  export type more_picturesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures to fetch.
     */
    where?: more_picturesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures to fetch.
     */
    orderBy?: more_picturesOrderByWithRelationInput | more_picturesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures.
     */
    cursor?: more_picturesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures.
     */
    distinct?: More_picturesScalarFieldEnum | More_picturesScalarFieldEnum[]
  }

  /**
   * more_pictures findMany
   */
  export type more_picturesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures to fetch.
     */
    where?: more_picturesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures to fetch.
     */
    orderBy?: more_picturesOrderByWithRelationInput | more_picturesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing more_pictures.
     */
    cursor?: more_picturesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures.
     */
    skip?: number
    distinct?: More_picturesScalarFieldEnum | More_picturesScalarFieldEnum[]
  }

  /**
   * more_pictures create
   */
  export type more_picturesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * The data needed to create a more_pictures.
     */
    data: XOR<more_picturesCreateInput, more_picturesUncheckedCreateInput>
  }

  /**
   * more_pictures createMany
   */
  export type more_picturesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many more_pictures.
     */
    data: more_picturesCreateManyInput | more_picturesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * more_pictures update
   */
  export type more_picturesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * The data needed to update a more_pictures.
     */
    data: XOR<more_picturesUpdateInput, more_picturesUncheckedUpdateInput>
    /**
     * Choose, which more_pictures to update.
     */
    where: more_picturesWhereUniqueInput
  }

  /**
   * more_pictures updateMany
   */
  export type more_picturesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update more_pictures.
     */
    data: XOR<more_picturesUpdateManyMutationInput, more_picturesUncheckedUpdateManyInput>
    /**
     * Filter which more_pictures to update
     */
    where?: more_picturesWhereInput
    /**
     * Limit how many more_pictures to update.
     */
    limit?: number
  }

  /**
   * more_pictures upsert
   */
  export type more_picturesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * The filter to search for the more_pictures to update in case it exists.
     */
    where: more_picturesWhereUniqueInput
    /**
     * In case the more_pictures found by the `where` argument doesn't exist, create a new more_pictures with this data.
     */
    create: XOR<more_picturesCreateInput, more_picturesUncheckedCreateInput>
    /**
     * In case the more_pictures was found with the provided `where` argument, update it with this data.
     */
    update: XOR<more_picturesUpdateInput, more_picturesUncheckedUpdateInput>
  }

  /**
   * more_pictures delete
   */
  export type more_picturesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
    /**
     * Filter which more_pictures to delete.
     */
    where: more_picturesWhereUniqueInput
  }

  /**
   * more_pictures deleteMany
   */
  export type more_picturesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures to delete
     */
    where?: more_picturesWhereInput
    /**
     * Limit how many more_pictures to delete.
     */
    limit?: number
  }

  /**
   * more_pictures without action
   */
  export type more_picturesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures
     */
    select?: more_picturesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures
     */
    omit?: more_picturesOmit<ExtArgs> | null
  }


  /**
   * Model part
   */

  export type AggregatePart = {
    _count: PartCountAggregateOutputType | null
    _avg: PartAvgAggregateOutputType | null
    _sum: PartSumAggregateOutputType | null
    _min: PartMinAggregateOutputType | null
    _max: PartMaxAggregateOutputType | null
  }

  export type PartAvgAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_status: number | null
    users_action: number | null
  }

  export type PartSumAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_status: number | null
    users_action: number | null
  }

  export type PartMinAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_name: string | null
    part_picture: string | null
    part_color: string | null
    part_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PartMaxAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_name: string | null
    part_picture: string | null
    part_color: string | null
    part_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type PartCountAggregateOutputType = {
    part_id: number
    category_id: number
    sub_id: number
    part_name: number
    part_picture: number
    part_color: number
    part_status: number
    users_action: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type PartAvgAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_status?: true
    users_action?: true
  }

  export type PartSumAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_status?: true
    users_action?: true
  }

  export type PartMinAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_name?: true
    part_picture?: true
    part_color?: true
    part_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type PartMaxAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_name?: true
    part_picture?: true
    part_color?: true
    part_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type PartCountAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_name?: true
    part_picture?: true
    part_color?: true
    part_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type PartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which part to aggregate.
     */
    where?: partWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of parts to fetch.
     */
    orderBy?: partOrderByWithRelationInput | partOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: partWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` parts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` parts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned parts
    **/
    _count?: true | PartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PartMaxAggregateInputType
  }

  export type GetPartAggregateType<T extends PartAggregateArgs> = {
        [P in keyof T & keyof AggregatePart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePart[P]>
      : GetScalarType<T[P], AggregatePart[P]>
  }




  export type partGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: partWhereInput
    orderBy?: partOrderByWithAggregationInput | partOrderByWithAggregationInput[]
    by: PartScalarFieldEnum[] | PartScalarFieldEnum
    having?: partScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PartCountAggregateInputType | true
    _avg?: PartAvgAggregateInputType
    _sum?: PartSumAggregateInputType
    _min?: PartMinAggregateInputType
    _max?: PartMaxAggregateInputType
  }

  export type PartGroupByOutputType = {
    part_id: number
    category_id: number
    sub_id: number
    part_name: string
    part_picture: string | null
    part_color: string | null
    part_status: number
    users_action: number
    created_at: Date
    updated_at: Date
    _count: PartCountAggregateOutputType | null
    _avg: PartAvgAggregateOutputType | null
    _sum: PartSumAggregateOutputType | null
    _min: PartMinAggregateOutputType | null
    _max: PartMaxAggregateOutputType | null
  }

  type GetPartGroupByPayload<T extends partGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PartGroupByOutputType[P]>
            : GetScalarType<T[P], PartGroupByOutputType[P]>
        }
      >
    >


  export type partSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    part_id?: boolean
    category_id?: boolean
    sub_id?: boolean
    part_name?: boolean
    part_picture?: boolean
    part_color?: boolean
    part_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["part"]>



  export type partSelectScalar = {
    part_id?: boolean
    category_id?: boolean
    sub_id?: boolean
    part_name?: boolean
    part_picture?: boolean
    part_color?: boolean
    part_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type partOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"part_id" | "category_id" | "sub_id" | "part_name" | "part_picture" | "part_color" | "part_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["part"]>

  export type $partPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "part"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      part_id: number
      category_id: number
      sub_id: number
      part_name: string
      part_picture: string | null
      part_color: string | null
      part_status: number
      users_action: number
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["part"]>
    composites: {}
  }

  type partGetPayload<S extends boolean | null | undefined | partDefaultArgs> = $Result.GetResult<Prisma.$partPayload, S>

  type partCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<partFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PartCountAggregateInputType | true
    }

  export interface partDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['part'], meta: { name: 'part' } }
    /**
     * Find zero or one Part that matches the filter.
     * @param {partFindUniqueArgs} args - Arguments to find a Part
     * @example
     * // Get one Part
     * const part = await prisma.part.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends partFindUniqueArgs>(args: SelectSubset<T, partFindUniqueArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Part that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {partFindUniqueOrThrowArgs} args - Arguments to find a Part
     * @example
     * // Get one Part
     * const part = await prisma.part.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends partFindUniqueOrThrowArgs>(args: SelectSubset<T, partFindUniqueOrThrowArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Part that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partFindFirstArgs} args - Arguments to find a Part
     * @example
     * // Get one Part
     * const part = await prisma.part.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends partFindFirstArgs>(args?: SelectSubset<T, partFindFirstArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Part that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partFindFirstOrThrowArgs} args - Arguments to find a Part
     * @example
     * // Get one Part
     * const part = await prisma.part.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends partFindFirstOrThrowArgs>(args?: SelectSubset<T, partFindFirstOrThrowArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Parts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Parts
     * const parts = await prisma.part.findMany()
     * 
     * // Get first 10 Parts
     * const parts = await prisma.part.findMany({ take: 10 })
     * 
     * // Only select the `part_id`
     * const partWithPart_idOnly = await prisma.part.findMany({ select: { part_id: true } })
     * 
     */
    findMany<T extends partFindManyArgs>(args?: SelectSubset<T, partFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Part.
     * @param {partCreateArgs} args - Arguments to create a Part.
     * @example
     * // Create one Part
     * const Part = await prisma.part.create({
     *   data: {
     *     // ... data to create a Part
     *   }
     * })
     * 
     */
    create<T extends partCreateArgs>(args: SelectSubset<T, partCreateArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Parts.
     * @param {partCreateManyArgs} args - Arguments to create many Parts.
     * @example
     * // Create many Parts
     * const part = await prisma.part.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends partCreateManyArgs>(args?: SelectSubset<T, partCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Part.
     * @param {partDeleteArgs} args - Arguments to delete one Part.
     * @example
     * // Delete one Part
     * const Part = await prisma.part.delete({
     *   where: {
     *     // ... filter to delete one Part
     *   }
     * })
     * 
     */
    delete<T extends partDeleteArgs>(args: SelectSubset<T, partDeleteArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Part.
     * @param {partUpdateArgs} args - Arguments to update one Part.
     * @example
     * // Update one Part
     * const part = await prisma.part.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends partUpdateArgs>(args: SelectSubset<T, partUpdateArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Parts.
     * @param {partDeleteManyArgs} args - Arguments to filter Parts to delete.
     * @example
     * // Delete a few Parts
     * const { count } = await prisma.part.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends partDeleteManyArgs>(args?: SelectSubset<T, partDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Parts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Parts
     * const part = await prisma.part.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends partUpdateManyArgs>(args: SelectSubset<T, partUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Part.
     * @param {partUpsertArgs} args - Arguments to update or create a Part.
     * @example
     * // Update or create a Part
     * const part = await prisma.part.upsert({
     *   create: {
     *     // ... data to create a Part
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Part we want to update
     *   }
     * })
     */
    upsert<T extends partUpsertArgs>(args: SelectSubset<T, partUpsertArgs<ExtArgs>>): Prisma__partClient<$Result.GetResult<Prisma.$partPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Parts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partCountArgs} args - Arguments to filter Parts to count.
     * @example
     * // Count the number of Parts
     * const count = await prisma.part.count({
     *   where: {
     *     // ... the filter for the Parts we want to count
     *   }
     * })
    **/
    count<T extends partCountArgs>(
      args?: Subset<T, partCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Part.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PartAggregateArgs>(args: Subset<T, PartAggregateArgs>): Prisma.PrismaPromise<GetPartAggregateType<T>>

    /**
     * Group by Part.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {partGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends partGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: partGroupByArgs['orderBy'] }
        : { orderBy?: partGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, partGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the part model
   */
  readonly fields: partFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for part.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__partClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the part model
   */
  interface partFieldRefs {
    readonly part_id: FieldRef<"part", 'Int'>
    readonly category_id: FieldRef<"part", 'Int'>
    readonly sub_id: FieldRef<"part", 'Int'>
    readonly part_name: FieldRef<"part", 'String'>
    readonly part_picture: FieldRef<"part", 'String'>
    readonly part_color: FieldRef<"part", 'String'>
    readonly part_status: FieldRef<"part", 'Int'>
    readonly users_action: FieldRef<"part", 'Int'>
    readonly created_at: FieldRef<"part", 'DateTime'>
    readonly updated_at: FieldRef<"part", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * part findUnique
   */
  export type partFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter, which part to fetch.
     */
    where: partWhereUniqueInput
  }

  /**
   * part findUniqueOrThrow
   */
  export type partFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter, which part to fetch.
     */
    where: partWhereUniqueInput
  }

  /**
   * part findFirst
   */
  export type partFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter, which part to fetch.
     */
    where?: partWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of parts to fetch.
     */
    orderBy?: partOrderByWithRelationInput | partOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for parts.
     */
    cursor?: partWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` parts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` parts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of parts.
     */
    distinct?: PartScalarFieldEnum | PartScalarFieldEnum[]
  }

  /**
   * part findFirstOrThrow
   */
  export type partFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter, which part to fetch.
     */
    where?: partWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of parts to fetch.
     */
    orderBy?: partOrderByWithRelationInput | partOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for parts.
     */
    cursor?: partWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` parts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` parts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of parts.
     */
    distinct?: PartScalarFieldEnum | PartScalarFieldEnum[]
  }

  /**
   * part findMany
   */
  export type partFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter, which parts to fetch.
     */
    where?: partWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of parts to fetch.
     */
    orderBy?: partOrderByWithRelationInput | partOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing parts.
     */
    cursor?: partWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` parts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` parts.
     */
    skip?: number
    distinct?: PartScalarFieldEnum | PartScalarFieldEnum[]
  }

  /**
   * part create
   */
  export type partCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * The data needed to create a part.
     */
    data: XOR<partCreateInput, partUncheckedCreateInput>
  }

  /**
   * part createMany
   */
  export type partCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many parts.
     */
    data: partCreateManyInput | partCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * part update
   */
  export type partUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * The data needed to update a part.
     */
    data: XOR<partUpdateInput, partUncheckedUpdateInput>
    /**
     * Choose, which part to update.
     */
    where: partWhereUniqueInput
  }

  /**
   * part updateMany
   */
  export type partUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update parts.
     */
    data: XOR<partUpdateManyMutationInput, partUncheckedUpdateManyInput>
    /**
     * Filter which parts to update
     */
    where?: partWhereInput
    /**
     * Limit how many parts to update.
     */
    limit?: number
  }

  /**
   * part upsert
   */
  export type partUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * The filter to search for the part to update in case it exists.
     */
    where: partWhereUniqueInput
    /**
     * In case the part found by the `where` argument doesn't exist, create a new part with this data.
     */
    create: XOR<partCreateInput, partUncheckedCreateInput>
    /**
     * In case the part was found with the provided `where` argument, update it with this data.
     */
    update: XOR<partUpdateInput, partUncheckedUpdateInput>
  }

  /**
   * part delete
   */
  export type partDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
    /**
     * Filter which part to delete.
     */
    where: partWhereUniqueInput
  }

  /**
   * part deleteMany
   */
  export type partDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which parts to delete
     */
    where?: partWhereInput
    /**
     * Limit how many parts to delete.
     */
    limit?: number
  }

  /**
   * part without action
   */
  export type partDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part
     */
    select?: partSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part
     */
    omit?: partOmit<ExtArgs> | null
  }


  /**
   * Model product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    product_id: number | null
    category_id: number | null
    sub_id: number | null
    part_id: number | null
    product_price: Decimal | null
    product_new: number | null
    product_best: number | null
    product_status: number | null
    users_action: number | null
    clearanceQuantity: number | null
    clearancePrice: Decimal | null
    expo_status: number | null
    expo_price: Decimal | null
    cat5e: number | null
    cat6: number | null
    tool_tester: number | null
  }

  export type ProductSumAggregateOutputType = {
    product_id: number | null
    category_id: number | null
    sub_id: number | null
    part_id: number | null
    product_price: Decimal | null
    product_new: number | null
    product_best: number | null
    product_status: number | null
    users_action: number | null
    clearanceQuantity: number | null
    clearancePrice: Decimal | null
    expo_status: number | null
    expo_price: Decimal | null
    cat5e: number | null
    cat6: number | null
    tool_tester: number | null
  }

  export type ProductMinAggregateOutputType = {
    product_id: number | null
    category_id: number | null
    sub_id: number | null
    part_id: number | null
    product_name: string | null
    product_brand: string | null
    product_description: string | null
    product_picture: string | null
    product_sku: string | null
    product_file: string | null
    product_filename: string | null
    product_price: Decimal | null
    product_new: number | null
    product_best: number | null
    product_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
    product_uom: string | null
    clearanceSales: boolean | null
    clearanceQuantity: number | null
    clearancePrice: Decimal | null
    expo_status: number | null
    expo_price: Decimal | null
    cat5e: number | null
    cat6: number | null
    tool_tester: number | null
  }

  export type ProductMaxAggregateOutputType = {
    product_id: number | null
    category_id: number | null
    sub_id: number | null
    part_id: number | null
    product_name: string | null
    product_brand: string | null
    product_description: string | null
    product_picture: string | null
    product_sku: string | null
    product_file: string | null
    product_filename: string | null
    product_price: Decimal | null
    product_new: number | null
    product_best: number | null
    product_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
    product_uom: string | null
    clearanceSales: boolean | null
    clearanceQuantity: number | null
    clearancePrice: Decimal | null
    expo_status: number | null
    expo_price: Decimal | null
    cat5e: number | null
    cat6: number | null
    tool_tester: number | null
  }

  export type ProductCountAggregateOutputType = {
    product_id: number
    category_id: number
    sub_id: number
    part_id: number
    product_name: number
    product_brand: number
    product_description: number
    product_picture: number
    product_sku: number
    product_file: number
    product_filename: number
    product_price: number
    product_new: number
    product_best: number
    product_status: number
    users_action: number
    created_at: number
    updated_at: number
    product_uom: number
    clearanceSales: number
    clearanceQuantity: number
    clearancePrice: number
    expo_status: number
    expo_price: number
    cat5e: number
    cat6: number
    tool_tester: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    product_id?: true
    category_id?: true
    sub_id?: true
    part_id?: true
    product_price?: true
    product_new?: true
    product_best?: true
    product_status?: true
    users_action?: true
    clearanceQuantity?: true
    clearancePrice?: true
    expo_status?: true
    expo_price?: true
    cat5e?: true
    cat6?: true
    tool_tester?: true
  }

  export type ProductSumAggregateInputType = {
    product_id?: true
    category_id?: true
    sub_id?: true
    part_id?: true
    product_price?: true
    product_new?: true
    product_best?: true
    product_status?: true
    users_action?: true
    clearanceQuantity?: true
    clearancePrice?: true
    expo_status?: true
    expo_price?: true
    cat5e?: true
    cat6?: true
    tool_tester?: true
  }

  export type ProductMinAggregateInputType = {
    product_id?: true
    category_id?: true
    sub_id?: true
    part_id?: true
    product_name?: true
    product_brand?: true
    product_description?: true
    product_picture?: true
    product_sku?: true
    product_file?: true
    product_filename?: true
    product_price?: true
    product_new?: true
    product_best?: true
    product_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    product_uom?: true
    clearanceSales?: true
    clearanceQuantity?: true
    clearancePrice?: true
    expo_status?: true
    expo_price?: true
    cat5e?: true
    cat6?: true
    tool_tester?: true
  }

  export type ProductMaxAggregateInputType = {
    product_id?: true
    category_id?: true
    sub_id?: true
    part_id?: true
    product_name?: true
    product_brand?: true
    product_description?: true
    product_picture?: true
    product_sku?: true
    product_file?: true
    product_filename?: true
    product_price?: true
    product_new?: true
    product_best?: true
    product_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    product_uom?: true
    clearanceSales?: true
    clearanceQuantity?: true
    clearancePrice?: true
    expo_status?: true
    expo_price?: true
    cat5e?: true
    cat6?: true
    tool_tester?: true
  }

  export type ProductCountAggregateInputType = {
    product_id?: true
    category_id?: true
    sub_id?: true
    part_id?: true
    product_name?: true
    product_brand?: true
    product_description?: true
    product_picture?: true
    product_sku?: true
    product_file?: true
    product_filename?: true
    product_price?: true
    product_new?: true
    product_best?: true
    product_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    product_uom?: true
    clearanceSales?: true
    clearanceQuantity?: true
    clearancePrice?: true
    expo_status?: true
    expo_price?: true
    cat5e?: true
    cat6?: true
    tool_tester?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product to aggregate.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type productGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: productWhereInput
    orderBy?: productOrderByWithAggregationInput | productOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: productScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    product_id: number
    category_id: number | null
    sub_id: number | null
    part_id: number | null
    product_name: string | null
    product_brand: string | null
    product_description: string | null
    product_picture: string | null
    product_sku: string | null
    product_file: string | null
    product_filename: string | null
    product_price: Decimal | null
    product_new: number | null
    product_best: number | null
    product_status: number | null
    users_action: number | null
    created_at: Date
    updated_at: Date
    product_uom: string | null
    clearanceSales: boolean | null
    clearanceQuantity: number | null
    clearancePrice: Decimal | null
    expo_status: number | null
    expo_price: Decimal | null
    cat5e: number | null
    cat6: number | null
    tool_tester: number | null
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends productGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type productSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    product_id?: boolean
    category_id?: boolean
    sub_id?: boolean
    part_id?: boolean
    product_name?: boolean
    product_brand?: boolean
    product_description?: boolean
    product_picture?: boolean
    product_sku?: boolean
    product_file?: boolean
    product_filename?: boolean
    product_price?: boolean
    product_new?: boolean
    product_best?: boolean
    product_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
    product_uom?: boolean
    clearanceSales?: boolean
    clearanceQuantity?: boolean
    clearancePrice?: boolean
    expo_status?: boolean
    expo_price?: boolean
    cat5e?: boolean
    cat6?: boolean
    tool_tester?: boolean
  }, ExtArgs["result"]["product"]>



  export type productSelectScalar = {
    product_id?: boolean
    category_id?: boolean
    sub_id?: boolean
    part_id?: boolean
    product_name?: boolean
    product_brand?: boolean
    product_description?: boolean
    product_picture?: boolean
    product_sku?: boolean
    product_file?: boolean
    product_filename?: boolean
    product_price?: boolean
    product_new?: boolean
    product_best?: boolean
    product_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
    product_uom?: boolean
    clearanceSales?: boolean
    clearanceQuantity?: boolean
    clearancePrice?: boolean
    expo_status?: boolean
    expo_price?: boolean
    cat5e?: boolean
    cat6?: boolean
    tool_tester?: boolean
  }

  export type productOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"product_id" | "category_id" | "sub_id" | "part_id" | "product_name" | "product_brand" | "product_description" | "product_picture" | "product_sku" | "product_file" | "product_filename" | "product_price" | "product_new" | "product_best" | "product_status" | "users_action" | "created_at" | "updated_at" | "product_uom" | "clearanceSales" | "clearanceQuantity" | "clearancePrice" | "expo_status" | "expo_price" | "cat5e" | "cat6" | "tool_tester", ExtArgs["result"]["product"]>

  export type $productPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "product"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      product_id: number
      category_id: number | null
      sub_id: number | null
      part_id: number | null
      product_name: string | null
      product_brand: string | null
      product_description: string | null
      product_picture: string | null
      product_sku: string | null
      product_file: string | null
      product_filename: string | null
      product_price: Prisma.Decimal | null
      product_new: number | null
      product_best: number | null
      product_status: number | null
      users_action: number | null
      created_at: Date
      updated_at: Date
      product_uom: string | null
      /**
       * This field was commented out because of an invalid name. Please provide a valid one that matches [a-zA-Z][a-zA-Z0-9_]*
       * This field was commented out because of an invalid name. Please provide a valid one that matches [a-zA-Z][a-zA-Z0-9_]*
       * This field was commented out because of an invalid name. Please provide a valid one that matches [a-zA-Z][a-zA-Z0-9_]*
       */
      clearanceSales: boolean | null
      clearanceQuantity: number | null
      clearancePrice: Prisma.Decimal | null
      expo_status: number | null
      expo_price: Prisma.Decimal | null
      cat5e: number | null
      cat6: number | null
      tool_tester: number | null
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type productGetPayload<S extends boolean | null | undefined | productDefaultArgs> = $Result.GetResult<Prisma.$productPayload, S>

  type productCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<productFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface productDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['product'], meta: { name: 'product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {productFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends productFindUniqueArgs>(args: SelectSubset<T, productFindUniqueArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {productFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends productFindUniqueOrThrowArgs>(args: SelectSubset<T, productFindUniqueOrThrowArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends productFindFirstArgs>(args?: SelectSubset<T, productFindFirstArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends productFindFirstOrThrowArgs>(args?: SelectSubset<T, productFindFirstOrThrowArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `product_id`
     * const productWithProduct_idOnly = await prisma.product.findMany({ select: { product_id: true } })
     * 
     */
    findMany<T extends productFindManyArgs>(args?: SelectSubset<T, productFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {productCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends productCreateArgs>(args: SelectSubset<T, productCreateArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {productCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends productCreateManyArgs>(args?: SelectSubset<T, productCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Product.
     * @param {productDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends productDeleteArgs>(args: SelectSubset<T, productDeleteArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {productUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends productUpdateArgs>(args: SelectSubset<T, productUpdateArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {productDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends productDeleteManyArgs>(args?: SelectSubset<T, productDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends productUpdateManyArgs>(args: SelectSubset<T, productUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product.
     * @param {productUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends productUpsertArgs>(args: SelectSubset<T, productUpsertArgs<ExtArgs>>): Prisma__productClient<$Result.GetResult<Prisma.$productPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends productCountArgs>(
      args?: Subset<T, productCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {productGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends productGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: productGroupByArgs['orderBy'] }
        : { orderBy?: productGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, productGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the product model
   */
  readonly fields: productFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__productClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the product model
   */
  interface productFieldRefs {
    readonly product_id: FieldRef<"product", 'Int'>
    readonly category_id: FieldRef<"product", 'Int'>
    readonly sub_id: FieldRef<"product", 'Int'>
    readonly part_id: FieldRef<"product", 'Int'>
    readonly product_name: FieldRef<"product", 'String'>
    readonly product_brand: FieldRef<"product", 'String'>
    readonly product_description: FieldRef<"product", 'String'>
    readonly product_picture: FieldRef<"product", 'String'>
    readonly product_sku: FieldRef<"product", 'String'>
    readonly product_file: FieldRef<"product", 'String'>
    readonly product_filename: FieldRef<"product", 'String'>
    readonly product_price: FieldRef<"product", 'Decimal'>
    readonly product_new: FieldRef<"product", 'Int'>
    readonly product_best: FieldRef<"product", 'Int'>
    readonly product_status: FieldRef<"product", 'Int'>
    readonly users_action: FieldRef<"product", 'Int'>
    readonly created_at: FieldRef<"product", 'DateTime'>
    readonly updated_at: FieldRef<"product", 'DateTime'>
    readonly product_uom: FieldRef<"product", 'String'>
    readonly clearanceSales: FieldRef<"product", 'Boolean'>
    readonly clearanceQuantity: FieldRef<"product", 'Int'>
    readonly clearancePrice: FieldRef<"product", 'Decimal'>
    readonly expo_status: FieldRef<"product", 'Int'>
    readonly expo_price: FieldRef<"product", 'Decimal'>
    readonly cat5e: FieldRef<"product", 'Int'>
    readonly cat6: FieldRef<"product", 'Int'>
    readonly tool_tester: FieldRef<"product", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * product findUnique
   */
  export type productFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where: productWhereUniqueInput
  }

  /**
   * product findUniqueOrThrow
   */
  export type productFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where: productWhereUniqueInput
  }

  /**
   * product findFirst
   */
  export type productFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product findFirstOrThrow
   */
  export type productFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter, which product to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product findMany
   */
  export type productFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter, which products to fetch.
     */
    where?: productWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of products to fetch.
     */
    orderBy?: productOrderByWithRelationInput | productOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing products.
     */
    cursor?: productWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * product create
   */
  export type productCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * The data needed to create a product.
     */
    data?: XOR<productCreateInput, productUncheckedCreateInput>
  }

  /**
   * product createMany
   */
  export type productCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many products.
     */
    data: productCreateManyInput | productCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * product update
   */
  export type productUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * The data needed to update a product.
     */
    data: XOR<productUpdateInput, productUncheckedUpdateInput>
    /**
     * Choose, which product to update.
     */
    where: productWhereUniqueInput
  }

  /**
   * product updateMany
   */
  export type productUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update products.
     */
    data: XOR<productUpdateManyMutationInput, productUncheckedUpdateManyInput>
    /**
     * Filter which products to update
     */
    where?: productWhereInput
    /**
     * Limit how many products to update.
     */
    limit?: number
  }

  /**
   * product upsert
   */
  export type productUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * The filter to search for the product to update in case it exists.
     */
    where: productWhereUniqueInput
    /**
     * In case the product found by the `where` argument doesn't exist, create a new product with this data.
     */
    create: XOR<productCreateInput, productUncheckedCreateInput>
    /**
     * In case the product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<productUpdateInput, productUncheckedUpdateInput>
  }

  /**
   * product delete
   */
  export type productDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
    /**
     * Filter which product to delete.
     */
    where: productWhereUniqueInput
  }

  /**
   * product deleteMany
   */
  export type productDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which products to delete
     */
    where?: productWhereInput
    /**
     * Limit how many products to delete.
     */
    limit?: number
  }

  /**
   * product without action
   */
  export type productDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product
     */
    select?: productSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product
     */
    omit?: productOmit<ExtArgs> | null
  }


  /**
   * Model sub
   */

  export type AggregateSub = {
    _count: SubCountAggregateOutputType | null
    _avg: SubAvgAggregateOutputType | null
    _sum: SubSumAggregateOutputType | null
    _min: SubMinAggregateOutputType | null
    _max: SubMaxAggregateOutputType | null
  }

  export type SubAvgAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_status: number | null
    users_action: number | null
  }

  export type SubSumAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_status: number | null
    users_action: number | null
  }

  export type SubMinAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_name: string | null
    sub_keyword: string | null
    sub_title: string | null
    sub_description: string | null
    sub_picture: string | null
    sub_color: string | null
    sub_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SubMaxAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_name: string | null
    sub_keyword: string | null
    sub_title: string | null
    sub_description: string | null
    sub_picture: string | null
    sub_color: string | null
    sub_status: number | null
    users_action: number | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type SubCountAggregateOutputType = {
    sub_id: number
    category_id: number
    sub_name: number
    sub_keyword: number
    sub_title: number
    sub_description: number
    sub_picture: number
    sub_color: number
    sub_status: number
    users_action: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type SubAvgAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_status?: true
    users_action?: true
  }

  export type SubSumAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_status?: true
    users_action?: true
  }

  export type SubMinAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_name?: true
    sub_keyword?: true
    sub_title?: true
    sub_description?: true
    sub_picture?: true
    sub_color?: true
    sub_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type SubMaxAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_name?: true
    sub_keyword?: true
    sub_title?: true
    sub_description?: true
    sub_picture?: true
    sub_color?: true
    sub_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
  }

  export type SubCountAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_name?: true
    sub_keyword?: true
    sub_title?: true
    sub_description?: true
    sub_picture?: true
    sub_color?: true
    sub_status?: true
    users_action?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type SubAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sub to aggregate.
     */
    where?: subWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subs to fetch.
     */
    orderBy?: subOrderByWithRelationInput | subOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: subWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned subs
    **/
    _count?: true | SubCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubMaxAggregateInputType
  }

  export type GetSubAggregateType<T extends SubAggregateArgs> = {
        [P in keyof T & keyof AggregateSub]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSub[P]>
      : GetScalarType<T[P], AggregateSub[P]>
  }




  export type subGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: subWhereInput
    orderBy?: subOrderByWithAggregationInput | subOrderByWithAggregationInput[]
    by: SubScalarFieldEnum[] | SubScalarFieldEnum
    having?: subScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubCountAggregateInputType | true
    _avg?: SubAvgAggregateInputType
    _sum?: SubSumAggregateInputType
    _min?: SubMinAggregateInputType
    _max?: SubMaxAggregateInputType
  }

  export type SubGroupByOutputType = {
    sub_id: number
    category_id: number
    sub_name: string
    sub_keyword: string | null
    sub_title: string | null
    sub_description: string | null
    sub_picture: string | null
    sub_color: string | null
    sub_status: number
    users_action: number
    created_at: Date
    updated_at: Date
    _count: SubCountAggregateOutputType | null
    _avg: SubAvgAggregateOutputType | null
    _sum: SubSumAggregateOutputType | null
    _min: SubMinAggregateOutputType | null
    _max: SubMaxAggregateOutputType | null
  }

  type GetSubGroupByPayload<T extends subGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubGroupByOutputType[P]>
            : GetScalarType<T[P], SubGroupByOutputType[P]>
        }
      >
    >


  export type subSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sub_id?: boolean
    category_id?: boolean
    sub_name?: boolean
    sub_keyword?: boolean
    sub_title?: boolean
    sub_description?: boolean
    sub_picture?: boolean
    sub_color?: boolean
    sub_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["sub"]>



  export type subSelectScalar = {
    sub_id?: boolean
    category_id?: boolean
    sub_name?: boolean
    sub_keyword?: boolean
    sub_title?: boolean
    sub_description?: boolean
    sub_picture?: boolean
    sub_color?: boolean
    sub_status?: boolean
    users_action?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type subOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"sub_id" | "category_id" | "sub_name" | "sub_keyword" | "sub_title" | "sub_description" | "sub_picture" | "sub_color" | "sub_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["sub"]>

  export type $subPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "sub"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      sub_id: number
      category_id: number
      sub_name: string
      sub_keyword: string | null
      sub_title: string | null
      sub_description: string | null
      sub_picture: string | null
      sub_color: string | null
      sub_status: number
      users_action: number
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["sub"]>
    composites: {}
  }

  type subGetPayload<S extends boolean | null | undefined | subDefaultArgs> = $Result.GetResult<Prisma.$subPayload, S>

  type subCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<subFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubCountAggregateInputType | true
    }

  export interface subDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['sub'], meta: { name: 'sub' } }
    /**
     * Find zero or one Sub that matches the filter.
     * @param {subFindUniqueArgs} args - Arguments to find a Sub
     * @example
     * // Get one Sub
     * const sub = await prisma.sub.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends subFindUniqueArgs>(args: SelectSubset<T, subFindUniqueArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sub that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {subFindUniqueOrThrowArgs} args - Arguments to find a Sub
     * @example
     * // Get one Sub
     * const sub = await prisma.sub.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends subFindUniqueOrThrowArgs>(args: SelectSubset<T, subFindUniqueOrThrowArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sub that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subFindFirstArgs} args - Arguments to find a Sub
     * @example
     * // Get one Sub
     * const sub = await prisma.sub.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends subFindFirstArgs>(args?: SelectSubset<T, subFindFirstArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sub that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subFindFirstOrThrowArgs} args - Arguments to find a Sub
     * @example
     * // Get one Sub
     * const sub = await prisma.sub.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends subFindFirstOrThrowArgs>(args?: SelectSubset<T, subFindFirstOrThrowArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Subs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Subs
     * const subs = await prisma.sub.findMany()
     * 
     * // Get first 10 Subs
     * const subs = await prisma.sub.findMany({ take: 10 })
     * 
     * // Only select the `sub_id`
     * const subWithSub_idOnly = await prisma.sub.findMany({ select: { sub_id: true } })
     * 
     */
    findMany<T extends subFindManyArgs>(args?: SelectSubset<T, subFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sub.
     * @param {subCreateArgs} args - Arguments to create a Sub.
     * @example
     * // Create one Sub
     * const Sub = await prisma.sub.create({
     *   data: {
     *     // ... data to create a Sub
     *   }
     * })
     * 
     */
    create<T extends subCreateArgs>(args: SelectSubset<T, subCreateArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Subs.
     * @param {subCreateManyArgs} args - Arguments to create many Subs.
     * @example
     * // Create many Subs
     * const sub = await prisma.sub.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends subCreateManyArgs>(args?: SelectSubset<T, subCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Sub.
     * @param {subDeleteArgs} args - Arguments to delete one Sub.
     * @example
     * // Delete one Sub
     * const Sub = await prisma.sub.delete({
     *   where: {
     *     // ... filter to delete one Sub
     *   }
     * })
     * 
     */
    delete<T extends subDeleteArgs>(args: SelectSubset<T, subDeleteArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sub.
     * @param {subUpdateArgs} args - Arguments to update one Sub.
     * @example
     * // Update one Sub
     * const sub = await prisma.sub.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends subUpdateArgs>(args: SelectSubset<T, subUpdateArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Subs.
     * @param {subDeleteManyArgs} args - Arguments to filter Subs to delete.
     * @example
     * // Delete a few Subs
     * const { count } = await prisma.sub.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends subDeleteManyArgs>(args?: SelectSubset<T, subDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Subs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Subs
     * const sub = await prisma.sub.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends subUpdateManyArgs>(args: SelectSubset<T, subUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sub.
     * @param {subUpsertArgs} args - Arguments to update or create a Sub.
     * @example
     * // Update or create a Sub
     * const sub = await prisma.sub.upsert({
     *   create: {
     *     // ... data to create a Sub
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sub we want to update
     *   }
     * })
     */
    upsert<T extends subUpsertArgs>(args: SelectSubset<T, subUpsertArgs<ExtArgs>>): Prisma__subClient<$Result.GetResult<Prisma.$subPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Subs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subCountArgs} args - Arguments to filter Subs to count.
     * @example
     * // Count the number of Subs
     * const count = await prisma.sub.count({
     *   where: {
     *     // ... the filter for the Subs we want to count
     *   }
     * })
    **/
    count<T extends subCountArgs>(
      args?: Subset<T, subCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sub.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubAggregateArgs>(args: Subset<T, SubAggregateArgs>): Prisma.PrismaPromise<GetSubAggregateType<T>>

    /**
     * Group by Sub.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {subGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends subGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: subGroupByArgs['orderBy'] }
        : { orderBy?: subGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, subGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the sub model
   */
  readonly fields: subFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for sub.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__subClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the sub model
   */
  interface subFieldRefs {
    readonly sub_id: FieldRef<"sub", 'Int'>
    readonly category_id: FieldRef<"sub", 'Int'>
    readonly sub_name: FieldRef<"sub", 'String'>
    readonly sub_keyword: FieldRef<"sub", 'String'>
    readonly sub_title: FieldRef<"sub", 'String'>
    readonly sub_description: FieldRef<"sub", 'String'>
    readonly sub_picture: FieldRef<"sub", 'String'>
    readonly sub_color: FieldRef<"sub", 'String'>
    readonly sub_status: FieldRef<"sub", 'Int'>
    readonly users_action: FieldRef<"sub", 'Int'>
    readonly created_at: FieldRef<"sub", 'DateTime'>
    readonly updated_at: FieldRef<"sub", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * sub findUnique
   */
  export type subFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter, which sub to fetch.
     */
    where: subWhereUniqueInput
  }

  /**
   * sub findUniqueOrThrow
   */
  export type subFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter, which sub to fetch.
     */
    where: subWhereUniqueInput
  }

  /**
   * sub findFirst
   */
  export type subFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter, which sub to fetch.
     */
    where?: subWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subs to fetch.
     */
    orderBy?: subOrderByWithRelationInput | subOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subs.
     */
    cursor?: subWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subs.
     */
    distinct?: SubScalarFieldEnum | SubScalarFieldEnum[]
  }

  /**
   * sub findFirstOrThrow
   */
  export type subFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter, which sub to fetch.
     */
    where?: subWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subs to fetch.
     */
    orderBy?: subOrderByWithRelationInput | subOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for subs.
     */
    cursor?: subWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of subs.
     */
    distinct?: SubScalarFieldEnum | SubScalarFieldEnum[]
  }

  /**
   * sub findMany
   */
  export type subFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter, which subs to fetch.
     */
    where?: subWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of subs to fetch.
     */
    orderBy?: subOrderByWithRelationInput | subOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing subs.
     */
    cursor?: subWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` subs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` subs.
     */
    skip?: number
    distinct?: SubScalarFieldEnum | SubScalarFieldEnum[]
  }

  /**
   * sub create
   */
  export type subCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * The data needed to create a sub.
     */
    data: XOR<subCreateInput, subUncheckedCreateInput>
  }

  /**
   * sub createMany
   */
  export type subCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many subs.
     */
    data: subCreateManyInput | subCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * sub update
   */
  export type subUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * The data needed to update a sub.
     */
    data: XOR<subUpdateInput, subUncheckedUpdateInput>
    /**
     * Choose, which sub to update.
     */
    where: subWhereUniqueInput
  }

  /**
   * sub updateMany
   */
  export type subUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update subs.
     */
    data: XOR<subUpdateManyMutationInput, subUncheckedUpdateManyInput>
    /**
     * Filter which subs to update
     */
    where?: subWhereInput
    /**
     * Limit how many subs to update.
     */
    limit?: number
  }

  /**
   * sub upsert
   */
  export type subUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * The filter to search for the sub to update in case it exists.
     */
    where: subWhereUniqueInput
    /**
     * In case the sub found by the `where` argument doesn't exist, create a new sub with this data.
     */
    create: XOR<subCreateInput, subUncheckedCreateInput>
    /**
     * In case the sub was found with the provided `where` argument, update it with this data.
     */
    update: XOR<subUpdateInput, subUncheckedUpdateInput>
  }

  /**
   * sub delete
   */
  export type subDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
    /**
     * Filter which sub to delete.
     */
    where: subWhereUniqueInput
  }

  /**
   * sub deleteMany
   */
  export type subDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which subs to delete
     */
    where?: subWhereInput
    /**
     * Limit how many subs to delete.
     */
    limit?: number
  }

  /**
   * sub without action
   */
  export type subDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub
     */
    select?: subSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub
     */
    omit?: subOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CategoryScalarFieldEnum: {
    category_id: 'category_id',
    category_name: 'category_name',
    category_number: 'category_number',
    category_keyword: 'category_keyword',
    category_title: 'category_title',
    category_description: 'category_description',
    category_color: 'category_color',
    category_picture: 'category_picture',
    category_status: 'category_status',
    users_action: 'users_action',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const More_picturesScalarFieldEnum: {
    mp_id: 'mp_id',
    product_id: 'product_id',
    product_picture: 'product_picture',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type More_picturesScalarFieldEnum = (typeof More_picturesScalarFieldEnum)[keyof typeof More_picturesScalarFieldEnum]


  export const PartScalarFieldEnum: {
    part_id: 'part_id',
    category_id: 'category_id',
    sub_id: 'sub_id',
    part_name: 'part_name',
    part_picture: 'part_picture',
    part_color: 'part_color',
    part_status: 'part_status',
    users_action: 'users_action',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type PartScalarFieldEnum = (typeof PartScalarFieldEnum)[keyof typeof PartScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    product_id: 'product_id',
    category_id: 'category_id',
    sub_id: 'sub_id',
    part_id: 'part_id',
    product_name: 'product_name',
    product_brand: 'product_brand',
    product_description: 'product_description',
    product_picture: 'product_picture',
    product_sku: 'product_sku',
    product_file: 'product_file',
    product_filename: 'product_filename',
    product_price: 'product_price',
    product_new: 'product_new',
    product_best: 'product_best',
    product_status: 'product_status',
    users_action: 'users_action',
    created_at: 'created_at',
    updated_at: 'updated_at',
    product_uom: 'product_uom',
    clearanceSales: 'clearanceSales',
    clearanceQuantity: 'clearanceQuantity',
    clearancePrice: 'clearancePrice',
    expo_status: 'expo_status',
    expo_price: 'expo_price',
    cat5e: 'cat5e',
    cat6: 'cat6',
    tool_tester: 'tool_tester'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const SubScalarFieldEnum: {
    sub_id: 'sub_id',
    category_id: 'category_id',
    sub_name: 'sub_name',
    sub_keyword: 'sub_keyword',
    sub_title: 'sub_title',
    sub_description: 'sub_description',
    sub_picture: 'sub_picture',
    sub_color: 'sub_color',
    sub_status: 'sub_status',
    users_action: 'users_action',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type SubScalarFieldEnum = (typeof SubScalarFieldEnum)[keyof typeof SubScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const categoryOrderByRelevanceFieldEnum: {
    category_name: 'category_name',
    category_keyword: 'category_keyword',
    category_title: 'category_title',
    category_description: 'category_description',
    category_color: 'category_color',
    category_picture: 'category_picture'
  };

  export type categoryOrderByRelevanceFieldEnum = (typeof categoryOrderByRelevanceFieldEnum)[keyof typeof categoryOrderByRelevanceFieldEnum]


  export const more_picturesOrderByRelevanceFieldEnum: {
    product_picture: 'product_picture',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type more_picturesOrderByRelevanceFieldEnum = (typeof more_picturesOrderByRelevanceFieldEnum)[keyof typeof more_picturesOrderByRelevanceFieldEnum]


  export const partOrderByRelevanceFieldEnum: {
    part_name: 'part_name',
    part_picture: 'part_picture',
    part_color: 'part_color'
  };

  export type partOrderByRelevanceFieldEnum = (typeof partOrderByRelevanceFieldEnum)[keyof typeof partOrderByRelevanceFieldEnum]


  export const productOrderByRelevanceFieldEnum: {
    product_name: 'product_name',
    product_brand: 'product_brand',
    product_description: 'product_description',
    product_picture: 'product_picture',
    product_sku: 'product_sku',
    product_file: 'product_file',
    product_filename: 'product_filename',
    product_uom: 'product_uom'
  };

  export type productOrderByRelevanceFieldEnum = (typeof productOrderByRelevanceFieldEnum)[keyof typeof productOrderByRelevanceFieldEnum]


  export const subOrderByRelevanceFieldEnum: {
    sub_name: 'sub_name',
    sub_keyword: 'sub_keyword',
    sub_title: 'sub_title',
    sub_description: 'sub_description',
    sub_picture: 'sub_picture',
    sub_color: 'sub_color'
  };

  export type subOrderByRelevanceFieldEnum = (typeof subOrderByRelevanceFieldEnum)[keyof typeof subOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type categoryWhereInput = {
    AND?: categoryWhereInput | categoryWhereInput[]
    OR?: categoryWhereInput[]
    NOT?: categoryWhereInput | categoryWhereInput[]
    category_id?: IntFilter<"category"> | number
    category_name?: StringFilter<"category"> | string
    category_number?: IntFilter<"category"> | number
    category_keyword?: StringNullableFilter<"category"> | string | null
    category_title?: StringNullableFilter<"category"> | string | null
    category_description?: StringNullableFilter<"category"> | string | null
    category_color?: StringNullableFilter<"category"> | string | null
    category_picture?: StringNullableFilter<"category"> | string | null
    category_status?: IntFilter<"category"> | number
    users_action?: IntFilter<"category"> | number
    created_at?: DateTimeFilter<"category"> | Date | string
    updated_at?: DateTimeFilter<"category"> | Date | string
  }

  export type categoryOrderByWithRelationInput = {
    category_id?: SortOrder
    category_name?: SortOrder
    category_number?: SortOrder
    category_keyword?: SortOrderInput | SortOrder
    category_title?: SortOrderInput | SortOrder
    category_description?: SortOrderInput | SortOrder
    category_color?: SortOrderInput | SortOrder
    category_picture?: SortOrderInput | SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _relevance?: categoryOrderByRelevanceInput
  }

  export type categoryWhereUniqueInput = Prisma.AtLeast<{
    category_id?: number
    AND?: categoryWhereInput | categoryWhereInput[]
    OR?: categoryWhereInput[]
    NOT?: categoryWhereInput | categoryWhereInput[]
    category_name?: StringFilter<"category"> | string
    category_number?: IntFilter<"category"> | number
    category_keyword?: StringNullableFilter<"category"> | string | null
    category_title?: StringNullableFilter<"category"> | string | null
    category_description?: StringNullableFilter<"category"> | string | null
    category_color?: StringNullableFilter<"category"> | string | null
    category_picture?: StringNullableFilter<"category"> | string | null
    category_status?: IntFilter<"category"> | number
    users_action?: IntFilter<"category"> | number
    created_at?: DateTimeFilter<"category"> | Date | string
    updated_at?: DateTimeFilter<"category"> | Date | string
  }, "category_id">

  export type categoryOrderByWithAggregationInput = {
    category_id?: SortOrder
    category_name?: SortOrder
    category_number?: SortOrder
    category_keyword?: SortOrderInput | SortOrder
    category_title?: SortOrderInput | SortOrder
    category_description?: SortOrderInput | SortOrder
    category_color?: SortOrderInput | SortOrder
    category_picture?: SortOrderInput | SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: categoryCountOrderByAggregateInput
    _avg?: categoryAvgOrderByAggregateInput
    _max?: categoryMaxOrderByAggregateInput
    _min?: categoryMinOrderByAggregateInput
    _sum?: categorySumOrderByAggregateInput
  }

  export type categoryScalarWhereWithAggregatesInput = {
    AND?: categoryScalarWhereWithAggregatesInput | categoryScalarWhereWithAggregatesInput[]
    OR?: categoryScalarWhereWithAggregatesInput[]
    NOT?: categoryScalarWhereWithAggregatesInput | categoryScalarWhereWithAggregatesInput[]
    category_id?: IntWithAggregatesFilter<"category"> | number
    category_name?: StringWithAggregatesFilter<"category"> | string
    category_number?: IntWithAggregatesFilter<"category"> | number
    category_keyword?: StringNullableWithAggregatesFilter<"category"> | string | null
    category_title?: StringNullableWithAggregatesFilter<"category"> | string | null
    category_description?: StringNullableWithAggregatesFilter<"category"> | string | null
    category_color?: StringNullableWithAggregatesFilter<"category"> | string | null
    category_picture?: StringNullableWithAggregatesFilter<"category"> | string | null
    category_status?: IntWithAggregatesFilter<"category"> | number
    users_action?: IntWithAggregatesFilter<"category"> | number
    created_at?: DateTimeWithAggregatesFilter<"category"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"category"> | Date | string
  }

  export type more_picturesWhereInput = {
    AND?: more_picturesWhereInput | more_picturesWhereInput[]
    OR?: more_picturesWhereInput[]
    NOT?: more_picturesWhereInput | more_picturesWhereInput[]
    mp_id?: BigIntFilter<"more_pictures"> | bigint | number
    product_id?: IntFilter<"more_pictures"> | number
    product_picture?: StringFilter<"more_pictures"> | string
    create_date?: DateTimeFilter<"more_pictures"> | Date | string
    create_name?: StringFilter<"more_pictures"> | string
    update_date?: DateTimeFilter<"more_pictures"> | Date | string
    update_name?: StringFilter<"more_pictures"> | string
  }

  export type more_picturesOrderByWithRelationInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: more_picturesOrderByRelevanceInput
  }

  export type more_picturesWhereUniqueInput = Prisma.AtLeast<{
    mp_id?: bigint | number
    AND?: more_picturesWhereInput | more_picturesWhereInput[]
    OR?: more_picturesWhereInput[]
    NOT?: more_picturesWhereInput | more_picturesWhereInput[]
    product_id?: IntFilter<"more_pictures"> | number
    product_picture?: StringFilter<"more_pictures"> | string
    create_date?: DateTimeFilter<"more_pictures"> | Date | string
    create_name?: StringFilter<"more_pictures"> | string
    update_date?: DateTimeFilter<"more_pictures"> | Date | string
    update_name?: StringFilter<"more_pictures"> | string
  }, "mp_id">

  export type more_picturesOrderByWithAggregationInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: more_picturesCountOrderByAggregateInput
    _avg?: more_picturesAvgOrderByAggregateInput
    _max?: more_picturesMaxOrderByAggregateInput
    _min?: more_picturesMinOrderByAggregateInput
    _sum?: more_picturesSumOrderByAggregateInput
  }

  export type more_picturesScalarWhereWithAggregatesInput = {
    AND?: more_picturesScalarWhereWithAggregatesInput | more_picturesScalarWhereWithAggregatesInput[]
    OR?: more_picturesScalarWhereWithAggregatesInput[]
    NOT?: more_picturesScalarWhereWithAggregatesInput | more_picturesScalarWhereWithAggregatesInput[]
    mp_id?: BigIntWithAggregatesFilter<"more_pictures"> | bigint | number
    product_id?: IntWithAggregatesFilter<"more_pictures"> | number
    product_picture?: StringWithAggregatesFilter<"more_pictures"> | string
    create_date?: DateTimeWithAggregatesFilter<"more_pictures"> | Date | string
    create_name?: StringWithAggregatesFilter<"more_pictures"> | string
    update_date?: DateTimeWithAggregatesFilter<"more_pictures"> | Date | string
    update_name?: StringWithAggregatesFilter<"more_pictures"> | string
  }

  export type partWhereInput = {
    AND?: partWhereInput | partWhereInput[]
    OR?: partWhereInput[]
    NOT?: partWhereInput | partWhereInput[]
    part_id?: IntFilter<"part"> | number
    category_id?: IntFilter<"part"> | number
    sub_id?: IntFilter<"part"> | number
    part_name?: StringFilter<"part"> | string
    part_picture?: StringNullableFilter<"part"> | string | null
    part_color?: StringNullableFilter<"part"> | string | null
    part_status?: IntFilter<"part"> | number
    users_action?: IntFilter<"part"> | number
    created_at?: DateTimeFilter<"part"> | Date | string
    updated_at?: DateTimeFilter<"part"> | Date | string
  }

  export type partOrderByWithRelationInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_name?: SortOrder
    part_picture?: SortOrderInput | SortOrder
    part_color?: SortOrderInput | SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _relevance?: partOrderByRelevanceInput
  }

  export type partWhereUniqueInput = Prisma.AtLeast<{
    part_id?: number
    AND?: partWhereInput | partWhereInput[]
    OR?: partWhereInput[]
    NOT?: partWhereInput | partWhereInput[]
    category_id?: IntFilter<"part"> | number
    sub_id?: IntFilter<"part"> | number
    part_name?: StringFilter<"part"> | string
    part_picture?: StringNullableFilter<"part"> | string | null
    part_color?: StringNullableFilter<"part"> | string | null
    part_status?: IntFilter<"part"> | number
    users_action?: IntFilter<"part"> | number
    created_at?: DateTimeFilter<"part"> | Date | string
    updated_at?: DateTimeFilter<"part"> | Date | string
  }, "part_id">

  export type partOrderByWithAggregationInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_name?: SortOrder
    part_picture?: SortOrderInput | SortOrder
    part_color?: SortOrderInput | SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: partCountOrderByAggregateInput
    _avg?: partAvgOrderByAggregateInput
    _max?: partMaxOrderByAggregateInput
    _min?: partMinOrderByAggregateInput
    _sum?: partSumOrderByAggregateInput
  }

  export type partScalarWhereWithAggregatesInput = {
    AND?: partScalarWhereWithAggregatesInput | partScalarWhereWithAggregatesInput[]
    OR?: partScalarWhereWithAggregatesInput[]
    NOT?: partScalarWhereWithAggregatesInput | partScalarWhereWithAggregatesInput[]
    part_id?: IntWithAggregatesFilter<"part"> | number
    category_id?: IntWithAggregatesFilter<"part"> | number
    sub_id?: IntWithAggregatesFilter<"part"> | number
    part_name?: StringWithAggregatesFilter<"part"> | string
    part_picture?: StringNullableWithAggregatesFilter<"part"> | string | null
    part_color?: StringNullableWithAggregatesFilter<"part"> | string | null
    part_status?: IntWithAggregatesFilter<"part"> | number
    users_action?: IntWithAggregatesFilter<"part"> | number
    created_at?: DateTimeWithAggregatesFilter<"part"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"part"> | Date | string
  }

  export type productWhereInput = {
    AND?: productWhereInput | productWhereInput[]
    OR?: productWhereInput[]
    NOT?: productWhereInput | productWhereInput[]
    product_id?: IntFilter<"product"> | number
    category_id?: IntNullableFilter<"product"> | number | null
    sub_id?: IntNullableFilter<"product"> | number | null
    part_id?: IntNullableFilter<"product"> | number | null
    product_name?: StringNullableFilter<"product"> | string | null
    product_brand?: StringNullableFilter<"product"> | string | null
    product_description?: StringNullableFilter<"product"> | string | null
    product_picture?: StringNullableFilter<"product"> | string | null
    product_sku?: StringNullableFilter<"product"> | string | null
    product_file?: StringNullableFilter<"product"> | string | null
    product_filename?: StringNullableFilter<"product"> | string | null
    product_price?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product"> | number | null
    product_best?: IntNullableFilter<"product"> | number | null
    product_status?: IntNullableFilter<"product"> | number | null
    users_action?: IntNullableFilter<"product"> | number | null
    created_at?: DateTimeFilter<"product"> | Date | string
    updated_at?: DateTimeFilter<"product"> | Date | string
    product_uom?: StringNullableFilter<"product"> | string | null
    clearanceSales?: BoolNullableFilter<"product"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product"> | number | null
    clearancePrice?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product"> | number | null
    expo_price?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product"> | number | null
    cat6?: IntNullableFilter<"product"> | number | null
    tool_tester?: IntNullableFilter<"product"> | number | null
  }

  export type productOrderByWithRelationInput = {
    product_id?: SortOrder
    category_id?: SortOrderInput | SortOrder
    sub_id?: SortOrderInput | SortOrder
    part_id?: SortOrderInput | SortOrder
    product_name?: SortOrderInput | SortOrder
    product_brand?: SortOrderInput | SortOrder
    product_description?: SortOrderInput | SortOrder
    product_picture?: SortOrderInput | SortOrder
    product_sku?: SortOrderInput | SortOrder
    product_file?: SortOrderInput | SortOrder
    product_filename?: SortOrderInput | SortOrder
    product_price?: SortOrderInput | SortOrder
    product_new?: SortOrderInput | SortOrder
    product_best?: SortOrderInput | SortOrder
    product_status?: SortOrderInput | SortOrder
    users_action?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    product_uom?: SortOrderInput | SortOrder
    clearanceSales?: SortOrderInput | SortOrder
    clearanceQuantity?: SortOrderInput | SortOrder
    clearancePrice?: SortOrderInput | SortOrder
    expo_status?: SortOrderInput | SortOrder
    expo_price?: SortOrderInput | SortOrder
    cat5e?: SortOrderInput | SortOrder
    cat6?: SortOrderInput | SortOrder
    tool_tester?: SortOrderInput | SortOrder
    _relevance?: productOrderByRelevanceInput
  }

  export type productWhereUniqueInput = Prisma.AtLeast<{
    product_id?: number
    AND?: productWhereInput | productWhereInput[]
    OR?: productWhereInput[]
    NOT?: productWhereInput | productWhereInput[]
    category_id?: IntNullableFilter<"product"> | number | null
    sub_id?: IntNullableFilter<"product"> | number | null
    part_id?: IntNullableFilter<"product"> | number | null
    product_name?: StringNullableFilter<"product"> | string | null
    product_brand?: StringNullableFilter<"product"> | string | null
    product_description?: StringNullableFilter<"product"> | string | null
    product_picture?: StringNullableFilter<"product"> | string | null
    product_sku?: StringNullableFilter<"product"> | string | null
    product_file?: StringNullableFilter<"product"> | string | null
    product_filename?: StringNullableFilter<"product"> | string | null
    product_price?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product"> | number | null
    product_best?: IntNullableFilter<"product"> | number | null
    product_status?: IntNullableFilter<"product"> | number | null
    users_action?: IntNullableFilter<"product"> | number | null
    created_at?: DateTimeFilter<"product"> | Date | string
    updated_at?: DateTimeFilter<"product"> | Date | string
    product_uom?: StringNullableFilter<"product"> | string | null
    clearanceSales?: BoolNullableFilter<"product"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product"> | number | null
    clearancePrice?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product"> | number | null
    expo_price?: DecimalNullableFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product"> | number | null
    cat6?: IntNullableFilter<"product"> | number | null
    tool_tester?: IntNullableFilter<"product"> | number | null
  }, "product_id">

  export type productOrderByWithAggregationInput = {
    product_id?: SortOrder
    category_id?: SortOrderInput | SortOrder
    sub_id?: SortOrderInput | SortOrder
    part_id?: SortOrderInput | SortOrder
    product_name?: SortOrderInput | SortOrder
    product_brand?: SortOrderInput | SortOrder
    product_description?: SortOrderInput | SortOrder
    product_picture?: SortOrderInput | SortOrder
    product_sku?: SortOrderInput | SortOrder
    product_file?: SortOrderInput | SortOrder
    product_filename?: SortOrderInput | SortOrder
    product_price?: SortOrderInput | SortOrder
    product_new?: SortOrderInput | SortOrder
    product_best?: SortOrderInput | SortOrder
    product_status?: SortOrderInput | SortOrder
    users_action?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    product_uom?: SortOrderInput | SortOrder
    clearanceSales?: SortOrderInput | SortOrder
    clearanceQuantity?: SortOrderInput | SortOrder
    clearancePrice?: SortOrderInput | SortOrder
    expo_status?: SortOrderInput | SortOrder
    expo_price?: SortOrderInput | SortOrder
    cat5e?: SortOrderInput | SortOrder
    cat6?: SortOrderInput | SortOrder
    tool_tester?: SortOrderInput | SortOrder
    _count?: productCountOrderByAggregateInput
    _avg?: productAvgOrderByAggregateInput
    _max?: productMaxOrderByAggregateInput
    _min?: productMinOrderByAggregateInput
    _sum?: productSumOrderByAggregateInput
  }

  export type productScalarWhereWithAggregatesInput = {
    AND?: productScalarWhereWithAggregatesInput | productScalarWhereWithAggregatesInput[]
    OR?: productScalarWhereWithAggregatesInput[]
    NOT?: productScalarWhereWithAggregatesInput | productScalarWhereWithAggregatesInput[]
    product_id?: IntWithAggregatesFilter<"product"> | number
    category_id?: IntNullableWithAggregatesFilter<"product"> | number | null
    sub_id?: IntNullableWithAggregatesFilter<"product"> | number | null
    part_id?: IntNullableWithAggregatesFilter<"product"> | number | null
    product_name?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_brand?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_description?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_picture?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_sku?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_file?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_filename?: StringNullableWithAggregatesFilter<"product"> | string | null
    product_price?: DecimalNullableWithAggregatesFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableWithAggregatesFilter<"product"> | number | null
    product_best?: IntNullableWithAggregatesFilter<"product"> | number | null
    product_status?: IntNullableWithAggregatesFilter<"product"> | number | null
    users_action?: IntNullableWithAggregatesFilter<"product"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"product"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"product"> | Date | string
    product_uom?: StringNullableWithAggregatesFilter<"product"> | string | null
    clearanceSales?: BoolNullableWithAggregatesFilter<"product"> | boolean | null
    clearanceQuantity?: IntNullableWithAggregatesFilter<"product"> | number | null
    clearancePrice?: DecimalNullableWithAggregatesFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableWithAggregatesFilter<"product"> | number | null
    expo_price?: DecimalNullableWithAggregatesFilter<"product"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableWithAggregatesFilter<"product"> | number | null
    cat6?: IntNullableWithAggregatesFilter<"product"> | number | null
    tool_tester?: IntNullableWithAggregatesFilter<"product"> | number | null
  }

  export type subWhereInput = {
    AND?: subWhereInput | subWhereInput[]
    OR?: subWhereInput[]
    NOT?: subWhereInput | subWhereInput[]
    sub_id?: IntFilter<"sub"> | number
    category_id?: IntFilter<"sub"> | number
    sub_name?: StringFilter<"sub"> | string
    sub_keyword?: StringNullableFilter<"sub"> | string | null
    sub_title?: StringNullableFilter<"sub"> | string | null
    sub_description?: StringNullableFilter<"sub"> | string | null
    sub_picture?: StringNullableFilter<"sub"> | string | null
    sub_color?: StringNullableFilter<"sub"> | string | null
    sub_status?: IntFilter<"sub"> | number
    users_action?: IntFilter<"sub"> | number
    created_at?: DateTimeFilter<"sub"> | Date | string
    updated_at?: DateTimeFilter<"sub"> | Date | string
  }

  export type subOrderByWithRelationInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_name?: SortOrder
    sub_keyword?: SortOrderInput | SortOrder
    sub_title?: SortOrderInput | SortOrder
    sub_description?: SortOrderInput | SortOrder
    sub_picture?: SortOrderInput | SortOrder
    sub_color?: SortOrderInput | SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _relevance?: subOrderByRelevanceInput
  }

  export type subWhereUniqueInput = Prisma.AtLeast<{
    sub_id?: number
    AND?: subWhereInput | subWhereInput[]
    OR?: subWhereInput[]
    NOT?: subWhereInput | subWhereInput[]
    category_id?: IntFilter<"sub"> | number
    sub_name?: StringFilter<"sub"> | string
    sub_keyword?: StringNullableFilter<"sub"> | string | null
    sub_title?: StringNullableFilter<"sub"> | string | null
    sub_description?: StringNullableFilter<"sub"> | string | null
    sub_picture?: StringNullableFilter<"sub"> | string | null
    sub_color?: StringNullableFilter<"sub"> | string | null
    sub_status?: IntFilter<"sub"> | number
    users_action?: IntFilter<"sub"> | number
    created_at?: DateTimeFilter<"sub"> | Date | string
    updated_at?: DateTimeFilter<"sub"> | Date | string
  }, "sub_id">

  export type subOrderByWithAggregationInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_name?: SortOrder
    sub_keyword?: SortOrderInput | SortOrder
    sub_title?: SortOrderInput | SortOrder
    sub_description?: SortOrderInput | SortOrder
    sub_picture?: SortOrderInput | SortOrder
    sub_color?: SortOrderInput | SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: subCountOrderByAggregateInput
    _avg?: subAvgOrderByAggregateInput
    _max?: subMaxOrderByAggregateInput
    _min?: subMinOrderByAggregateInput
    _sum?: subSumOrderByAggregateInput
  }

  export type subScalarWhereWithAggregatesInput = {
    AND?: subScalarWhereWithAggregatesInput | subScalarWhereWithAggregatesInput[]
    OR?: subScalarWhereWithAggregatesInput[]
    NOT?: subScalarWhereWithAggregatesInput | subScalarWhereWithAggregatesInput[]
    sub_id?: IntWithAggregatesFilter<"sub"> | number
    category_id?: IntWithAggregatesFilter<"sub"> | number
    sub_name?: StringWithAggregatesFilter<"sub"> | string
    sub_keyword?: StringNullableWithAggregatesFilter<"sub"> | string | null
    sub_title?: StringNullableWithAggregatesFilter<"sub"> | string | null
    sub_description?: StringNullableWithAggregatesFilter<"sub"> | string | null
    sub_picture?: StringNullableWithAggregatesFilter<"sub"> | string | null
    sub_color?: StringNullableWithAggregatesFilter<"sub"> | string | null
    sub_status?: IntWithAggregatesFilter<"sub"> | number
    users_action?: IntWithAggregatesFilter<"sub"> | number
    created_at?: DateTimeWithAggregatesFilter<"sub"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"sub"> | Date | string
  }

  export type categoryCreateInput = {
    category_name: string
    category_number: number
    category_keyword?: string | null
    category_title?: string | null
    category_description?: string | null
    category_color?: string | null
    category_picture?: string | null
    category_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type categoryUncheckedCreateInput = {
    category_id?: number
    category_name: string
    category_number: number
    category_keyword?: string | null
    category_title?: string | null
    category_description?: string | null
    category_color?: string | null
    category_picture?: string | null
    category_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type categoryUpdateInput = {
    category_name?: StringFieldUpdateOperationsInput | string
    category_number?: IntFieldUpdateOperationsInput | number
    category_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    category_title?: NullableStringFieldUpdateOperationsInput | string | null
    category_description?: NullableStringFieldUpdateOperationsInput | string | null
    category_color?: NullableStringFieldUpdateOperationsInput | string | null
    category_picture?: NullableStringFieldUpdateOperationsInput | string | null
    category_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type categoryUncheckedUpdateInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    category_name?: StringFieldUpdateOperationsInput | string
    category_number?: IntFieldUpdateOperationsInput | number
    category_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    category_title?: NullableStringFieldUpdateOperationsInput | string | null
    category_description?: NullableStringFieldUpdateOperationsInput | string | null
    category_color?: NullableStringFieldUpdateOperationsInput | string | null
    category_picture?: NullableStringFieldUpdateOperationsInput | string | null
    category_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type categoryCreateManyInput = {
    category_id?: number
    category_name: string
    category_number: number
    category_keyword?: string | null
    category_title?: string | null
    category_description?: string | null
    category_color?: string | null
    category_picture?: string | null
    category_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type categoryUpdateManyMutationInput = {
    category_name?: StringFieldUpdateOperationsInput | string
    category_number?: IntFieldUpdateOperationsInput | number
    category_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    category_title?: NullableStringFieldUpdateOperationsInput | string | null
    category_description?: NullableStringFieldUpdateOperationsInput | string | null
    category_color?: NullableStringFieldUpdateOperationsInput | string | null
    category_picture?: NullableStringFieldUpdateOperationsInput | string | null
    category_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type categoryUncheckedUpdateManyInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    category_name?: StringFieldUpdateOperationsInput | string
    category_number?: IntFieldUpdateOperationsInput | number
    category_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    category_title?: NullableStringFieldUpdateOperationsInput | string | null
    category_description?: NullableStringFieldUpdateOperationsInput | string | null
    category_color?: NullableStringFieldUpdateOperationsInput | string | null
    category_picture?: NullableStringFieldUpdateOperationsInput | string | null
    category_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type more_picturesCreateInput = {
    mp_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_picturesUncheckedCreateInput = {
    mp_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_picturesUpdateInput = {
    mp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_picturesUncheckedUpdateInput = {
    mp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_picturesCreateManyInput = {
    mp_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_picturesUpdateManyMutationInput = {
    mp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_picturesUncheckedUpdateManyInput = {
    mp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type partCreateInput = {
    category_id: number
    sub_id: number
    part_name: string
    part_picture?: string | null
    part_color?: string | null
    part_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type partUncheckedCreateInput = {
    part_id?: number
    category_id: number
    sub_id: number
    part_name: string
    part_picture?: string | null
    part_color?: string | null
    part_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type partUpdateInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    sub_id?: IntFieldUpdateOperationsInput | number
    part_name?: StringFieldUpdateOperationsInput | string
    part_picture?: NullableStringFieldUpdateOperationsInput | string | null
    part_color?: NullableStringFieldUpdateOperationsInput | string | null
    part_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type partUncheckedUpdateInput = {
    part_id?: IntFieldUpdateOperationsInput | number
    category_id?: IntFieldUpdateOperationsInput | number
    sub_id?: IntFieldUpdateOperationsInput | number
    part_name?: StringFieldUpdateOperationsInput | string
    part_picture?: NullableStringFieldUpdateOperationsInput | string | null
    part_color?: NullableStringFieldUpdateOperationsInput | string | null
    part_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type partCreateManyInput = {
    part_id?: number
    category_id: number
    sub_id: number
    part_name: string
    part_picture?: string | null
    part_color?: string | null
    part_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type partUpdateManyMutationInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    sub_id?: IntFieldUpdateOperationsInput | number
    part_name?: StringFieldUpdateOperationsInput | string
    part_picture?: NullableStringFieldUpdateOperationsInput | string | null
    part_color?: NullableStringFieldUpdateOperationsInput | string | null
    part_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type partUncheckedUpdateManyInput = {
    part_id?: IntFieldUpdateOperationsInput | number
    category_id?: IntFieldUpdateOperationsInput | number
    sub_id?: IntFieldUpdateOperationsInput | number
    part_name?: StringFieldUpdateOperationsInput | string
    part_picture?: NullableStringFieldUpdateOperationsInput | string | null
    part_color?: NullableStringFieldUpdateOperationsInput | string | null
    part_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type productCreateInput = {
    category_id?: number | null
    sub_id?: number | null
    part_id?: number | null
    product_name?: string | null
    product_brand?: string | null
    product_description?: string | null
    product_picture?: string | null
    product_sku?: string | null
    product_file?: string | null
    product_filename?: string | null
    product_price?: Decimal | DecimalJsLike | number | string | null
    product_new?: number | null
    product_best?: number | null
    product_status?: number | null
    users_action?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    product_uom?: string | null
    clearanceSales?: boolean | null
    clearanceQuantity?: number | null
    clearancePrice?: Decimal | DecimalJsLike | number | string | null
    expo_status?: number | null
    expo_price?: Decimal | DecimalJsLike | number | string | null
    cat5e?: number | null
    cat6?: number | null
    tool_tester?: number | null
  }

  export type productUncheckedCreateInput = {
    product_id?: number
    category_id?: number | null
    sub_id?: number | null
    part_id?: number | null
    product_name?: string | null
    product_brand?: string | null
    product_description?: string | null
    product_picture?: string | null
    product_sku?: string | null
    product_file?: string | null
    product_filename?: string | null
    product_price?: Decimal | DecimalJsLike | number | string | null
    product_new?: number | null
    product_best?: number | null
    product_status?: number | null
    users_action?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    product_uom?: string | null
    clearanceSales?: boolean | null
    clearanceQuantity?: number | null
    clearancePrice?: Decimal | DecimalJsLike | number | string | null
    expo_status?: number | null
    expo_price?: Decimal | DecimalJsLike | number | string | null
    cat5e?: number | null
    cat6?: number | null
    tool_tester?: number | null
  }

  export type productUpdateInput = {
    category_id?: NullableIntFieldUpdateOperationsInput | number | null
    sub_id?: NullableIntFieldUpdateOperationsInput | number | null
    part_id?: NullableIntFieldUpdateOperationsInput | number | null
    product_name?: NullableStringFieldUpdateOperationsInput | string | null
    product_brand?: NullableStringFieldUpdateOperationsInput | string | null
    product_description?: NullableStringFieldUpdateOperationsInput | string | null
    product_picture?: NullableStringFieldUpdateOperationsInput | string | null
    product_sku?: NullableStringFieldUpdateOperationsInput | string | null
    product_file?: NullableStringFieldUpdateOperationsInput | string | null
    product_filename?: NullableStringFieldUpdateOperationsInput | string | null
    product_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    product_new?: NullableIntFieldUpdateOperationsInput | number | null
    product_best?: NullableIntFieldUpdateOperationsInput | number | null
    product_status?: NullableIntFieldUpdateOperationsInput | number | null
    users_action?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    product_uom?: NullableStringFieldUpdateOperationsInput | string | null
    clearanceSales?: NullableBoolFieldUpdateOperationsInput | boolean | null
    clearanceQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    clearancePrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    expo_status?: NullableIntFieldUpdateOperationsInput | number | null
    expo_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    cat5e?: NullableIntFieldUpdateOperationsInput | number | null
    cat6?: NullableIntFieldUpdateOperationsInput | number | null
    tool_tester?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type productUncheckedUpdateInput = {
    product_id?: IntFieldUpdateOperationsInput | number
    category_id?: NullableIntFieldUpdateOperationsInput | number | null
    sub_id?: NullableIntFieldUpdateOperationsInput | number | null
    part_id?: NullableIntFieldUpdateOperationsInput | number | null
    product_name?: NullableStringFieldUpdateOperationsInput | string | null
    product_brand?: NullableStringFieldUpdateOperationsInput | string | null
    product_description?: NullableStringFieldUpdateOperationsInput | string | null
    product_picture?: NullableStringFieldUpdateOperationsInput | string | null
    product_sku?: NullableStringFieldUpdateOperationsInput | string | null
    product_file?: NullableStringFieldUpdateOperationsInput | string | null
    product_filename?: NullableStringFieldUpdateOperationsInput | string | null
    product_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    product_new?: NullableIntFieldUpdateOperationsInput | number | null
    product_best?: NullableIntFieldUpdateOperationsInput | number | null
    product_status?: NullableIntFieldUpdateOperationsInput | number | null
    users_action?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    product_uom?: NullableStringFieldUpdateOperationsInput | string | null
    clearanceSales?: NullableBoolFieldUpdateOperationsInput | boolean | null
    clearanceQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    clearancePrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    expo_status?: NullableIntFieldUpdateOperationsInput | number | null
    expo_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    cat5e?: NullableIntFieldUpdateOperationsInput | number | null
    cat6?: NullableIntFieldUpdateOperationsInput | number | null
    tool_tester?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type productCreateManyInput = {
    product_id?: number
    category_id?: number | null
    sub_id?: number | null
    part_id?: number | null
    product_name?: string | null
    product_brand?: string | null
    product_description?: string | null
    product_picture?: string | null
    product_sku?: string | null
    product_file?: string | null
    product_filename?: string | null
    product_price?: Decimal | DecimalJsLike | number | string | null
    product_new?: number | null
    product_best?: number | null
    product_status?: number | null
    users_action?: number | null
    created_at?: Date | string
    updated_at?: Date | string
    product_uom?: string | null
    clearanceSales?: boolean | null
    clearanceQuantity?: number | null
    clearancePrice?: Decimal | DecimalJsLike | number | string | null
    expo_status?: number | null
    expo_price?: Decimal | DecimalJsLike | number | string | null
    cat5e?: number | null
    cat6?: number | null
    tool_tester?: number | null
  }

  export type productUpdateManyMutationInput = {
    category_id?: NullableIntFieldUpdateOperationsInput | number | null
    sub_id?: NullableIntFieldUpdateOperationsInput | number | null
    part_id?: NullableIntFieldUpdateOperationsInput | number | null
    product_name?: NullableStringFieldUpdateOperationsInput | string | null
    product_brand?: NullableStringFieldUpdateOperationsInput | string | null
    product_description?: NullableStringFieldUpdateOperationsInput | string | null
    product_picture?: NullableStringFieldUpdateOperationsInput | string | null
    product_sku?: NullableStringFieldUpdateOperationsInput | string | null
    product_file?: NullableStringFieldUpdateOperationsInput | string | null
    product_filename?: NullableStringFieldUpdateOperationsInput | string | null
    product_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    product_new?: NullableIntFieldUpdateOperationsInput | number | null
    product_best?: NullableIntFieldUpdateOperationsInput | number | null
    product_status?: NullableIntFieldUpdateOperationsInput | number | null
    users_action?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    product_uom?: NullableStringFieldUpdateOperationsInput | string | null
    clearanceSales?: NullableBoolFieldUpdateOperationsInput | boolean | null
    clearanceQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    clearancePrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    expo_status?: NullableIntFieldUpdateOperationsInput | number | null
    expo_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    cat5e?: NullableIntFieldUpdateOperationsInput | number | null
    cat6?: NullableIntFieldUpdateOperationsInput | number | null
    tool_tester?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type productUncheckedUpdateManyInput = {
    product_id?: IntFieldUpdateOperationsInput | number
    category_id?: NullableIntFieldUpdateOperationsInput | number | null
    sub_id?: NullableIntFieldUpdateOperationsInput | number | null
    part_id?: NullableIntFieldUpdateOperationsInput | number | null
    product_name?: NullableStringFieldUpdateOperationsInput | string | null
    product_brand?: NullableStringFieldUpdateOperationsInput | string | null
    product_description?: NullableStringFieldUpdateOperationsInput | string | null
    product_picture?: NullableStringFieldUpdateOperationsInput | string | null
    product_sku?: NullableStringFieldUpdateOperationsInput | string | null
    product_file?: NullableStringFieldUpdateOperationsInput | string | null
    product_filename?: NullableStringFieldUpdateOperationsInput | string | null
    product_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    product_new?: NullableIntFieldUpdateOperationsInput | number | null
    product_best?: NullableIntFieldUpdateOperationsInput | number | null
    product_status?: NullableIntFieldUpdateOperationsInput | number | null
    users_action?: NullableIntFieldUpdateOperationsInput | number | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    product_uom?: NullableStringFieldUpdateOperationsInput | string | null
    clearanceSales?: NullableBoolFieldUpdateOperationsInput | boolean | null
    clearanceQuantity?: NullableIntFieldUpdateOperationsInput | number | null
    clearancePrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    expo_status?: NullableIntFieldUpdateOperationsInput | number | null
    expo_price?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    cat5e?: NullableIntFieldUpdateOperationsInput | number | null
    cat6?: NullableIntFieldUpdateOperationsInput | number | null
    tool_tester?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type subCreateInput = {
    category_id: number
    sub_name: string
    sub_keyword?: string | null
    sub_title?: string | null
    sub_description?: string | null
    sub_picture?: string | null
    sub_color?: string | null
    sub_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type subUncheckedCreateInput = {
    sub_id?: number
    category_id: number
    sub_name: string
    sub_keyword?: string | null
    sub_title?: string | null
    sub_description?: string | null
    sub_picture?: string | null
    sub_color?: string | null
    sub_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type subUpdateInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    sub_name?: StringFieldUpdateOperationsInput | string
    sub_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    sub_title?: NullableStringFieldUpdateOperationsInput | string | null
    sub_description?: NullableStringFieldUpdateOperationsInput | string | null
    sub_picture?: NullableStringFieldUpdateOperationsInput | string | null
    sub_color?: NullableStringFieldUpdateOperationsInput | string | null
    sub_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type subUncheckedUpdateInput = {
    sub_id?: IntFieldUpdateOperationsInput | number
    category_id?: IntFieldUpdateOperationsInput | number
    sub_name?: StringFieldUpdateOperationsInput | string
    sub_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    sub_title?: NullableStringFieldUpdateOperationsInput | string | null
    sub_description?: NullableStringFieldUpdateOperationsInput | string | null
    sub_picture?: NullableStringFieldUpdateOperationsInput | string | null
    sub_color?: NullableStringFieldUpdateOperationsInput | string | null
    sub_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type subCreateManyInput = {
    sub_id?: number
    category_id: number
    sub_name: string
    sub_keyword?: string | null
    sub_title?: string | null
    sub_description?: string | null
    sub_picture?: string | null
    sub_color?: string | null
    sub_status?: number
    users_action: number
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type subUpdateManyMutationInput = {
    category_id?: IntFieldUpdateOperationsInput | number
    sub_name?: StringFieldUpdateOperationsInput | string
    sub_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    sub_title?: NullableStringFieldUpdateOperationsInput | string | null
    sub_description?: NullableStringFieldUpdateOperationsInput | string | null
    sub_picture?: NullableStringFieldUpdateOperationsInput | string | null
    sub_color?: NullableStringFieldUpdateOperationsInput | string | null
    sub_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type subUncheckedUpdateManyInput = {
    sub_id?: IntFieldUpdateOperationsInput | number
    category_id?: IntFieldUpdateOperationsInput | number
    sub_name?: StringFieldUpdateOperationsInput | string
    sub_keyword?: NullableStringFieldUpdateOperationsInput | string | null
    sub_title?: NullableStringFieldUpdateOperationsInput | string | null
    sub_description?: NullableStringFieldUpdateOperationsInput | string | null
    sub_picture?: NullableStringFieldUpdateOperationsInput | string | null
    sub_color?: NullableStringFieldUpdateOperationsInput | string | null
    sub_status?: IntFieldUpdateOperationsInput | number
    users_action?: IntFieldUpdateOperationsInput | number
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type categoryOrderByRelevanceInput = {
    fields: categoryOrderByRelevanceFieldEnum | categoryOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type categoryCountOrderByAggregateInput = {
    category_id?: SortOrder
    category_name?: SortOrder
    category_number?: SortOrder
    category_keyword?: SortOrder
    category_title?: SortOrder
    category_description?: SortOrder
    category_color?: SortOrder
    category_picture?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type categoryAvgOrderByAggregateInput = {
    category_id?: SortOrder
    category_number?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
  }

  export type categoryMaxOrderByAggregateInput = {
    category_id?: SortOrder
    category_name?: SortOrder
    category_number?: SortOrder
    category_keyword?: SortOrder
    category_title?: SortOrder
    category_description?: SortOrder
    category_color?: SortOrder
    category_picture?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type categoryMinOrderByAggregateInput = {
    category_id?: SortOrder
    category_name?: SortOrder
    category_number?: SortOrder
    category_keyword?: SortOrder
    category_title?: SortOrder
    category_description?: SortOrder
    category_color?: SortOrder
    category_picture?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type categorySumOrderByAggregateInput = {
    category_id?: SortOrder
    category_number?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type more_picturesOrderByRelevanceInput = {
    fields: more_picturesOrderByRelevanceFieldEnum | more_picturesOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type more_picturesCountOrderByAggregateInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_picturesAvgOrderByAggregateInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
  }

  export type more_picturesMaxOrderByAggregateInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_picturesMinOrderByAggregateInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_picturesSumOrderByAggregateInput = {
    mp_id?: SortOrder
    product_id?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type partOrderByRelevanceInput = {
    fields: partOrderByRelevanceFieldEnum | partOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type partCountOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_name?: SortOrder
    part_picture?: SortOrder
    part_color?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type partAvgOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
  }

  export type partMaxOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_name?: SortOrder
    part_picture?: SortOrder
    part_color?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type partMinOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_name?: SortOrder
    part_picture?: SortOrder
    part_color?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type partSumOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type productOrderByRelevanceInput = {
    fields: productOrderByRelevanceFieldEnum | productOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type productCountOrderByAggregateInput = {
    product_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_id?: SortOrder
    product_name?: SortOrder
    product_brand?: SortOrder
    product_description?: SortOrder
    product_picture?: SortOrder
    product_sku?: SortOrder
    product_file?: SortOrder
    product_filename?: SortOrder
    product_price?: SortOrder
    product_new?: SortOrder
    product_best?: SortOrder
    product_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    product_uom?: SortOrder
    clearanceSales?: SortOrder
    clearanceQuantity?: SortOrder
    clearancePrice?: SortOrder
    expo_status?: SortOrder
    expo_price?: SortOrder
    cat5e?: SortOrder
    cat6?: SortOrder
    tool_tester?: SortOrder
  }

  export type productAvgOrderByAggregateInput = {
    product_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_id?: SortOrder
    product_price?: SortOrder
    product_new?: SortOrder
    product_best?: SortOrder
    product_status?: SortOrder
    users_action?: SortOrder
    clearanceQuantity?: SortOrder
    clearancePrice?: SortOrder
    expo_status?: SortOrder
    expo_price?: SortOrder
    cat5e?: SortOrder
    cat6?: SortOrder
    tool_tester?: SortOrder
  }

  export type productMaxOrderByAggregateInput = {
    product_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_id?: SortOrder
    product_name?: SortOrder
    product_brand?: SortOrder
    product_description?: SortOrder
    product_picture?: SortOrder
    product_sku?: SortOrder
    product_file?: SortOrder
    product_filename?: SortOrder
    product_price?: SortOrder
    product_new?: SortOrder
    product_best?: SortOrder
    product_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    product_uom?: SortOrder
    clearanceSales?: SortOrder
    clearanceQuantity?: SortOrder
    clearancePrice?: SortOrder
    expo_status?: SortOrder
    expo_price?: SortOrder
    cat5e?: SortOrder
    cat6?: SortOrder
    tool_tester?: SortOrder
  }

  export type productMinOrderByAggregateInput = {
    product_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_id?: SortOrder
    product_name?: SortOrder
    product_brand?: SortOrder
    product_description?: SortOrder
    product_picture?: SortOrder
    product_sku?: SortOrder
    product_file?: SortOrder
    product_filename?: SortOrder
    product_price?: SortOrder
    product_new?: SortOrder
    product_best?: SortOrder
    product_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    product_uom?: SortOrder
    clearanceSales?: SortOrder
    clearanceQuantity?: SortOrder
    clearancePrice?: SortOrder
    expo_status?: SortOrder
    expo_price?: SortOrder
    cat5e?: SortOrder
    cat6?: SortOrder
    tool_tester?: SortOrder
  }

  export type productSumOrderByAggregateInput = {
    product_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_id?: SortOrder
    product_price?: SortOrder
    product_new?: SortOrder
    product_best?: SortOrder
    product_status?: SortOrder
    users_action?: SortOrder
    clearanceQuantity?: SortOrder
    clearancePrice?: SortOrder
    expo_status?: SortOrder
    expo_price?: SortOrder
    cat5e?: SortOrder
    cat6?: SortOrder
    tool_tester?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type subOrderByRelevanceInput = {
    fields: subOrderByRelevanceFieldEnum | subOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type subCountOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_name?: SortOrder
    sub_keyword?: SortOrder
    sub_title?: SortOrder
    sub_description?: SortOrder
    sub_picture?: SortOrder
    sub_color?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type subAvgOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
  }

  export type subMaxOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_name?: SortOrder
    sub_keyword?: SortOrder
    sub_title?: SortOrder
    sub_description?: SortOrder
    sub_picture?: SortOrder
    sub_color?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type subMinOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_name?: SortOrder
    sub_keyword?: SortOrder
    sub_title?: SortOrder
    sub_description?: SortOrder
    sub_picture?: SortOrder
    sub_color?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type subSumOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[]
    notIn?: bigint[] | number[]
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}