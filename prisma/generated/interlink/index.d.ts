
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
 * Model category_clearance
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type category_clearance = $Result.DefaultSelection<Prisma.$category_clearancePayload>
/**
 * Model discountpercentage_clearance_tb
 * 
 */
export type discountpercentage_clearance_tb = $Result.DefaultSelection<Prisma.$discountpercentage_clearance_tbPayload>
/**
 * Model discountpercentage_tb
 * 
 */
export type discountpercentage_tb = $Result.DefaultSelection<Prisma.$discountpercentage_tbPayload>
/**
 * Model more_pictures_clearance
 * 
 */
export type more_pictures_clearance = $Result.DefaultSelection<Prisma.$more_pictures_clearancePayload>
/**
 * Model more_pictures_test
 * 
 */
export type more_pictures_test = $Result.DefaultSelection<Prisma.$more_pictures_testPayload>
/**
 * Model part_clearance
 * 
 */
export type part_clearance = $Result.DefaultSelection<Prisma.$part_clearancePayload>
/**
 * Model producoptions_clearance_tb
 * 
 */
export type producoptions_clearance_tb = $Result.DefaultSelection<Prisma.$producoptions_clearance_tbPayload>
/**
 * Model producoptions_tb
 * 
 */
export type producoptions_tb = $Result.DefaultSelection<Prisma.$producoptions_tbPayload>
/**
 * Model product_clearance
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type product_clearance = $Result.DefaultSelection<Prisma.$product_clearancePayload>
/**
 * Model product_test_upload
 * This model or at least one of its fields has comments in the database, and requires an additional setup for migrations: Read more: https://pris.ly/d/database-comments
 */
export type product_test_upload = $Result.DefaultSelection<Prisma.$product_test_uploadPayload>
/**
 * Model sub_clearance
 * 
 */
export type sub_clearance = $Result.DefaultSelection<Prisma.$sub_clearancePayload>

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

  /**
   * `prisma.category_clearance`: Exposes CRUD operations for the **category_clearance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Category_clearances
    * const category_clearances = await prisma.category_clearance.findMany()
    * ```
    */
  get category_clearance(): Prisma.category_clearanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.discountpercentage_clearance_tb`: Exposes CRUD operations for the **discountpercentage_clearance_tb** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Discountpercentage_clearance_tbs
    * const discountpercentage_clearance_tbs = await prisma.discountpercentage_clearance_tb.findMany()
    * ```
    */
  get discountpercentage_clearance_tb(): Prisma.discountpercentage_clearance_tbDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.discountpercentage_tb`: Exposes CRUD operations for the **discountpercentage_tb** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Discountpercentage_tbs
    * const discountpercentage_tbs = await prisma.discountpercentage_tb.findMany()
    * ```
    */
  get discountpercentage_tb(): Prisma.discountpercentage_tbDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.more_pictures_clearance`: Exposes CRUD operations for the **more_pictures_clearance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more More_pictures_clearances
    * const more_pictures_clearances = await prisma.more_pictures_clearance.findMany()
    * ```
    */
  get more_pictures_clearance(): Prisma.more_pictures_clearanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.more_pictures_test`: Exposes CRUD operations for the **more_pictures_test** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more More_pictures_tests
    * const more_pictures_tests = await prisma.more_pictures_test.findMany()
    * ```
    */
  get more_pictures_test(): Prisma.more_pictures_testDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.part_clearance`: Exposes CRUD operations for the **part_clearance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Part_clearances
    * const part_clearances = await prisma.part_clearance.findMany()
    * ```
    */
  get part_clearance(): Prisma.part_clearanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.producoptions_clearance_tb`: Exposes CRUD operations for the **producoptions_clearance_tb** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Producoptions_clearance_tbs
    * const producoptions_clearance_tbs = await prisma.producoptions_clearance_tb.findMany()
    * ```
    */
  get producoptions_clearance_tb(): Prisma.producoptions_clearance_tbDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.producoptions_tb`: Exposes CRUD operations for the **producoptions_tb** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Producoptions_tbs
    * const producoptions_tbs = await prisma.producoptions_tb.findMany()
    * ```
    */
  get producoptions_tb(): Prisma.producoptions_tbDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product_clearance`: Exposes CRUD operations for the **product_clearance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Product_clearances
    * const product_clearances = await prisma.product_clearance.findMany()
    * ```
    */
  get product_clearance(): Prisma.product_clearanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product_test_upload`: Exposes CRUD operations for the **product_test_upload** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Product_test_uploads
    * const product_test_uploads = await prisma.product_test_upload.findMany()
    * ```
    */
  get product_test_upload(): Prisma.product_test_uploadDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sub_clearance`: Exposes CRUD operations for the **sub_clearance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sub_clearances
    * const sub_clearances = await prisma.sub_clearance.findMany()
    * ```
    */
  get sub_clearance(): Prisma.sub_clearanceDelegate<ExtArgs, ClientOptions>;
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
    sub: 'sub',
    category_clearance: 'category_clearance',
    discountpercentage_clearance_tb: 'discountpercentage_clearance_tb',
    discountpercentage_tb: 'discountpercentage_tb',
    more_pictures_clearance: 'more_pictures_clearance',
    more_pictures_test: 'more_pictures_test',
    part_clearance: 'part_clearance',
    producoptions_clearance_tb: 'producoptions_clearance_tb',
    producoptions_tb: 'producoptions_tb',
    product_clearance: 'product_clearance',
    product_test_upload: 'product_test_upload',
    sub_clearance: 'sub_clearance'
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
      modelProps: "category" | "more_pictures" | "part" | "product" | "sub" | "category_clearance" | "discountpercentage_clearance_tb" | "discountpercentage_tb" | "more_pictures_clearance" | "more_pictures_test" | "part_clearance" | "producoptions_clearance_tb" | "producoptions_tb" | "product_clearance" | "product_test_upload" | "sub_clearance"
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
      category_clearance: {
        payload: Prisma.$category_clearancePayload<ExtArgs>
        fields: Prisma.category_clearanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.category_clearanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.category_clearanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          findFirst: {
            args: Prisma.category_clearanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.category_clearanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          findMany: {
            args: Prisma.category_clearanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>[]
          }
          create: {
            args: Prisma.category_clearanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          createMany: {
            args: Prisma.category_clearanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.category_clearanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          update: {
            args: Prisma.category_clearanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          deleteMany: {
            args: Prisma.category_clearanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.category_clearanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.category_clearanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$category_clearancePayload>
          }
          aggregate: {
            args: Prisma.Category_clearanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory_clearance>
          }
          groupBy: {
            args: Prisma.category_clearanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<Category_clearanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.category_clearanceCountArgs<ExtArgs>
            result: $Utils.Optional<Category_clearanceCountAggregateOutputType> | number
          }
        }
      }
      discountpercentage_clearance_tb: {
        payload: Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>
        fields: Prisma.discountpercentage_clearance_tbFieldRefs
        operations: {
          findUnique: {
            args: Prisma.discountpercentage_clearance_tbFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.discountpercentage_clearance_tbFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          findFirst: {
            args: Prisma.discountpercentage_clearance_tbFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.discountpercentage_clearance_tbFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          findMany: {
            args: Prisma.discountpercentage_clearance_tbFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>[]
          }
          create: {
            args: Prisma.discountpercentage_clearance_tbCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          createMany: {
            args: Prisma.discountpercentage_clearance_tbCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.discountpercentage_clearance_tbDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          update: {
            args: Prisma.discountpercentage_clearance_tbUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          deleteMany: {
            args: Prisma.discountpercentage_clearance_tbDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.discountpercentage_clearance_tbUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.discountpercentage_clearance_tbUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_clearance_tbPayload>
          }
          aggregate: {
            args: Prisma.Discountpercentage_clearance_tbAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiscountpercentage_clearance_tb>
          }
          groupBy: {
            args: Prisma.discountpercentage_clearance_tbGroupByArgs<ExtArgs>
            result: $Utils.Optional<Discountpercentage_clearance_tbGroupByOutputType>[]
          }
          count: {
            args: Prisma.discountpercentage_clearance_tbCountArgs<ExtArgs>
            result: $Utils.Optional<Discountpercentage_clearance_tbCountAggregateOutputType> | number
          }
        }
      }
      discountpercentage_tb: {
        payload: Prisma.$discountpercentage_tbPayload<ExtArgs>
        fields: Prisma.discountpercentage_tbFieldRefs
        operations: {
          findUnique: {
            args: Prisma.discountpercentage_tbFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.discountpercentage_tbFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          findFirst: {
            args: Prisma.discountpercentage_tbFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.discountpercentage_tbFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          findMany: {
            args: Prisma.discountpercentage_tbFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>[]
          }
          create: {
            args: Prisma.discountpercentage_tbCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          createMany: {
            args: Prisma.discountpercentage_tbCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.discountpercentage_tbDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          update: {
            args: Prisma.discountpercentage_tbUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          deleteMany: {
            args: Prisma.discountpercentage_tbDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.discountpercentage_tbUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.discountpercentage_tbUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$discountpercentage_tbPayload>
          }
          aggregate: {
            args: Prisma.Discountpercentage_tbAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiscountpercentage_tb>
          }
          groupBy: {
            args: Prisma.discountpercentage_tbGroupByArgs<ExtArgs>
            result: $Utils.Optional<Discountpercentage_tbGroupByOutputType>[]
          }
          count: {
            args: Prisma.discountpercentage_tbCountArgs<ExtArgs>
            result: $Utils.Optional<Discountpercentage_tbCountAggregateOutputType> | number
          }
        }
      }
      more_pictures_clearance: {
        payload: Prisma.$more_pictures_clearancePayload<ExtArgs>
        fields: Prisma.more_pictures_clearanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.more_pictures_clearanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.more_pictures_clearanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          findFirst: {
            args: Prisma.more_pictures_clearanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.more_pictures_clearanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          findMany: {
            args: Prisma.more_pictures_clearanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>[]
          }
          create: {
            args: Prisma.more_pictures_clearanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          createMany: {
            args: Prisma.more_pictures_clearanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.more_pictures_clearanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          update: {
            args: Prisma.more_pictures_clearanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          deleteMany: {
            args: Prisma.more_pictures_clearanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.more_pictures_clearanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.more_pictures_clearanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_clearancePayload>
          }
          aggregate: {
            args: Prisma.More_pictures_clearanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMore_pictures_clearance>
          }
          groupBy: {
            args: Prisma.more_pictures_clearanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<More_pictures_clearanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.more_pictures_clearanceCountArgs<ExtArgs>
            result: $Utils.Optional<More_pictures_clearanceCountAggregateOutputType> | number
          }
        }
      }
      more_pictures_test: {
        payload: Prisma.$more_pictures_testPayload<ExtArgs>
        fields: Prisma.more_pictures_testFieldRefs
        operations: {
          findUnique: {
            args: Prisma.more_pictures_testFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.more_pictures_testFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          findFirst: {
            args: Prisma.more_pictures_testFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.more_pictures_testFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          findMany: {
            args: Prisma.more_pictures_testFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>[]
          }
          create: {
            args: Prisma.more_pictures_testCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          createMany: {
            args: Prisma.more_pictures_testCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.more_pictures_testDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          update: {
            args: Prisma.more_pictures_testUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          deleteMany: {
            args: Prisma.more_pictures_testDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.more_pictures_testUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.more_pictures_testUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$more_pictures_testPayload>
          }
          aggregate: {
            args: Prisma.More_pictures_testAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMore_pictures_test>
          }
          groupBy: {
            args: Prisma.more_pictures_testGroupByArgs<ExtArgs>
            result: $Utils.Optional<More_pictures_testGroupByOutputType>[]
          }
          count: {
            args: Prisma.more_pictures_testCountArgs<ExtArgs>
            result: $Utils.Optional<More_pictures_testCountAggregateOutputType> | number
          }
        }
      }
      part_clearance: {
        payload: Prisma.$part_clearancePayload<ExtArgs>
        fields: Prisma.part_clearanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.part_clearanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.part_clearanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          findFirst: {
            args: Prisma.part_clearanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.part_clearanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          findMany: {
            args: Prisma.part_clearanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>[]
          }
          create: {
            args: Prisma.part_clearanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          createMany: {
            args: Prisma.part_clearanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.part_clearanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          update: {
            args: Prisma.part_clearanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          deleteMany: {
            args: Prisma.part_clearanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.part_clearanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.part_clearanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$part_clearancePayload>
          }
          aggregate: {
            args: Prisma.Part_clearanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePart_clearance>
          }
          groupBy: {
            args: Prisma.part_clearanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<Part_clearanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.part_clearanceCountArgs<ExtArgs>
            result: $Utils.Optional<Part_clearanceCountAggregateOutputType> | number
          }
        }
      }
      producoptions_clearance_tb: {
        payload: Prisma.$producoptions_clearance_tbPayload<ExtArgs>
        fields: Prisma.producoptions_clearance_tbFieldRefs
        operations: {
          findUnique: {
            args: Prisma.producoptions_clearance_tbFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.producoptions_clearance_tbFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          findFirst: {
            args: Prisma.producoptions_clearance_tbFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.producoptions_clearance_tbFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          findMany: {
            args: Prisma.producoptions_clearance_tbFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>[]
          }
          create: {
            args: Prisma.producoptions_clearance_tbCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          createMany: {
            args: Prisma.producoptions_clearance_tbCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.producoptions_clearance_tbDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          update: {
            args: Prisma.producoptions_clearance_tbUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          deleteMany: {
            args: Prisma.producoptions_clearance_tbDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.producoptions_clearance_tbUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.producoptions_clearance_tbUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_clearance_tbPayload>
          }
          aggregate: {
            args: Prisma.Producoptions_clearance_tbAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProducoptions_clearance_tb>
          }
          groupBy: {
            args: Prisma.producoptions_clearance_tbGroupByArgs<ExtArgs>
            result: $Utils.Optional<Producoptions_clearance_tbGroupByOutputType>[]
          }
          count: {
            args: Prisma.producoptions_clearance_tbCountArgs<ExtArgs>
            result: $Utils.Optional<Producoptions_clearance_tbCountAggregateOutputType> | number
          }
        }
      }
      producoptions_tb: {
        payload: Prisma.$producoptions_tbPayload<ExtArgs>
        fields: Prisma.producoptions_tbFieldRefs
        operations: {
          findUnique: {
            args: Prisma.producoptions_tbFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.producoptions_tbFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          findFirst: {
            args: Prisma.producoptions_tbFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.producoptions_tbFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          findMany: {
            args: Prisma.producoptions_tbFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>[]
          }
          create: {
            args: Prisma.producoptions_tbCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          createMany: {
            args: Prisma.producoptions_tbCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.producoptions_tbDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          update: {
            args: Prisma.producoptions_tbUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          deleteMany: {
            args: Prisma.producoptions_tbDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.producoptions_tbUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.producoptions_tbUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$producoptions_tbPayload>
          }
          aggregate: {
            args: Prisma.Producoptions_tbAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProducoptions_tb>
          }
          groupBy: {
            args: Prisma.producoptions_tbGroupByArgs<ExtArgs>
            result: $Utils.Optional<Producoptions_tbGroupByOutputType>[]
          }
          count: {
            args: Prisma.producoptions_tbCountArgs<ExtArgs>
            result: $Utils.Optional<Producoptions_tbCountAggregateOutputType> | number
          }
        }
      }
      product_clearance: {
        payload: Prisma.$product_clearancePayload<ExtArgs>
        fields: Prisma.product_clearanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.product_clearanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.product_clearanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          findFirst: {
            args: Prisma.product_clearanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.product_clearanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          findMany: {
            args: Prisma.product_clearanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>[]
          }
          create: {
            args: Prisma.product_clearanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          createMany: {
            args: Prisma.product_clearanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.product_clearanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          update: {
            args: Prisma.product_clearanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          deleteMany: {
            args: Prisma.product_clearanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.product_clearanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.product_clearanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_clearancePayload>
          }
          aggregate: {
            args: Prisma.Product_clearanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct_clearance>
          }
          groupBy: {
            args: Prisma.product_clearanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<Product_clearanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.product_clearanceCountArgs<ExtArgs>
            result: $Utils.Optional<Product_clearanceCountAggregateOutputType> | number
          }
        }
      }
      product_test_upload: {
        payload: Prisma.$product_test_uploadPayload<ExtArgs>
        fields: Prisma.product_test_uploadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.product_test_uploadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.product_test_uploadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          findFirst: {
            args: Prisma.product_test_uploadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.product_test_uploadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          findMany: {
            args: Prisma.product_test_uploadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>[]
          }
          create: {
            args: Prisma.product_test_uploadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          createMany: {
            args: Prisma.product_test_uploadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.product_test_uploadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          update: {
            args: Prisma.product_test_uploadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          deleteMany: {
            args: Prisma.product_test_uploadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.product_test_uploadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.product_test_uploadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$product_test_uploadPayload>
          }
          aggregate: {
            args: Prisma.Product_test_uploadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct_test_upload>
          }
          groupBy: {
            args: Prisma.product_test_uploadGroupByArgs<ExtArgs>
            result: $Utils.Optional<Product_test_uploadGroupByOutputType>[]
          }
          count: {
            args: Prisma.product_test_uploadCountArgs<ExtArgs>
            result: $Utils.Optional<Product_test_uploadCountAggregateOutputType> | number
          }
        }
      }
      sub_clearance: {
        payload: Prisma.$sub_clearancePayload<ExtArgs>
        fields: Prisma.sub_clearanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.sub_clearanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.sub_clearanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          findFirst: {
            args: Prisma.sub_clearanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.sub_clearanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          findMany: {
            args: Prisma.sub_clearanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>[]
          }
          create: {
            args: Prisma.sub_clearanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          createMany: {
            args: Prisma.sub_clearanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.sub_clearanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          update: {
            args: Prisma.sub_clearanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          deleteMany: {
            args: Prisma.sub_clearanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.sub_clearanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.sub_clearanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sub_clearancePayload>
          }
          aggregate: {
            args: Prisma.Sub_clearanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSub_clearance>
          }
          groupBy: {
            args: Prisma.sub_clearanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<Sub_clearanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.sub_clearanceCountArgs<ExtArgs>
            result: $Utils.Optional<Sub_clearanceCountAggregateOutputType> | number
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
    category_clearance?: category_clearanceOmit
    discountpercentage_clearance_tb?: discountpercentage_clearance_tbOmit
    discountpercentage_tb?: discountpercentage_tbOmit
    more_pictures_clearance?: more_pictures_clearanceOmit
    more_pictures_test?: more_pictures_testOmit
    part_clearance?: part_clearanceOmit
    producoptions_clearance_tb?: producoptions_clearance_tbOmit
    producoptions_tb?: producoptions_tbOmit
    product_clearance?: product_clearanceOmit
    product_test_upload?: product_test_uploadOmit
    sub_clearance?: sub_clearanceOmit
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
   * Model category_clearance
   */

  export type AggregateCategory_clearance = {
    _count: Category_clearanceCountAggregateOutputType | null
    _avg: Category_clearanceAvgAggregateOutputType | null
    _sum: Category_clearanceSumAggregateOutputType | null
    _min: Category_clearanceMinAggregateOutputType | null
    _max: Category_clearanceMaxAggregateOutputType | null
  }

  export type Category_clearanceAvgAggregateOutputType = {
    category_id: number | null
    category_number: number | null
    category_status: number | null
    users_action: number | null
  }

  export type Category_clearanceSumAggregateOutputType = {
    category_id: number | null
    category_number: number | null
    category_status: number | null
    users_action: number | null
  }

  export type Category_clearanceMinAggregateOutputType = {
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

  export type Category_clearanceMaxAggregateOutputType = {
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

  export type Category_clearanceCountAggregateOutputType = {
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


  export type Category_clearanceAvgAggregateInputType = {
    category_id?: true
    category_number?: true
    category_status?: true
    users_action?: true
  }

  export type Category_clearanceSumAggregateInputType = {
    category_id?: true
    category_number?: true
    category_status?: true
    users_action?: true
  }

  export type Category_clearanceMinAggregateInputType = {
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

  export type Category_clearanceMaxAggregateInputType = {
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

  export type Category_clearanceCountAggregateInputType = {
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

  export type Category_clearanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which category_clearance to aggregate.
     */
    where?: category_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of category_clearances to fetch.
     */
    orderBy?: category_clearanceOrderByWithRelationInput | category_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: category_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` category_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` category_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned category_clearances
    **/
    _count?: true | Category_clearanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Category_clearanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Category_clearanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Category_clearanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Category_clearanceMaxAggregateInputType
  }

  export type GetCategory_clearanceAggregateType<T extends Category_clearanceAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory_clearance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory_clearance[P]>
      : GetScalarType<T[P], AggregateCategory_clearance[P]>
  }




  export type category_clearanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: category_clearanceWhereInput
    orderBy?: category_clearanceOrderByWithAggregationInput | category_clearanceOrderByWithAggregationInput[]
    by: Category_clearanceScalarFieldEnum[] | Category_clearanceScalarFieldEnum
    having?: category_clearanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Category_clearanceCountAggregateInputType | true
    _avg?: Category_clearanceAvgAggregateInputType
    _sum?: Category_clearanceSumAggregateInputType
    _min?: Category_clearanceMinAggregateInputType
    _max?: Category_clearanceMaxAggregateInputType
  }

  export type Category_clearanceGroupByOutputType = {
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
    _count: Category_clearanceCountAggregateOutputType | null
    _avg: Category_clearanceAvgAggregateOutputType | null
    _sum: Category_clearanceSumAggregateOutputType | null
    _min: Category_clearanceMinAggregateOutputType | null
    _max: Category_clearanceMaxAggregateOutputType | null
  }

  type GetCategory_clearanceGroupByPayload<T extends category_clearanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Category_clearanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Category_clearanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Category_clearanceGroupByOutputType[P]>
            : GetScalarType<T[P], Category_clearanceGroupByOutputType[P]>
        }
      >
    >


  export type category_clearanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["category_clearance"]>



  export type category_clearanceSelectScalar = {
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

  export type category_clearanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"category_id" | "category_name" | "category_number" | "category_keyword" | "category_title" | "category_description" | "category_color" | "category_picture" | "category_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["category_clearance"]>

  export type $category_clearancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "category_clearance"
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
    }, ExtArgs["result"]["category_clearance"]>
    composites: {}
  }

  type category_clearanceGetPayload<S extends boolean | null | undefined | category_clearanceDefaultArgs> = $Result.GetResult<Prisma.$category_clearancePayload, S>

  type category_clearanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<category_clearanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Category_clearanceCountAggregateInputType | true
    }

  export interface category_clearanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['category_clearance'], meta: { name: 'category_clearance' } }
    /**
     * Find zero or one Category_clearance that matches the filter.
     * @param {category_clearanceFindUniqueArgs} args - Arguments to find a Category_clearance
     * @example
     * // Get one Category_clearance
     * const category_clearance = await prisma.category_clearance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends category_clearanceFindUniqueArgs>(args: SelectSubset<T, category_clearanceFindUniqueArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category_clearance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {category_clearanceFindUniqueOrThrowArgs} args - Arguments to find a Category_clearance
     * @example
     * // Get one Category_clearance
     * const category_clearance = await prisma.category_clearance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends category_clearanceFindUniqueOrThrowArgs>(args: SelectSubset<T, category_clearanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category_clearance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceFindFirstArgs} args - Arguments to find a Category_clearance
     * @example
     * // Get one Category_clearance
     * const category_clearance = await prisma.category_clearance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends category_clearanceFindFirstArgs>(args?: SelectSubset<T, category_clearanceFindFirstArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category_clearance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceFindFirstOrThrowArgs} args - Arguments to find a Category_clearance
     * @example
     * // Get one Category_clearance
     * const category_clearance = await prisma.category_clearance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends category_clearanceFindFirstOrThrowArgs>(args?: SelectSubset<T, category_clearanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Category_clearances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Category_clearances
     * const category_clearances = await prisma.category_clearance.findMany()
     * 
     * // Get first 10 Category_clearances
     * const category_clearances = await prisma.category_clearance.findMany({ take: 10 })
     * 
     * // Only select the `category_id`
     * const category_clearanceWithCategory_idOnly = await prisma.category_clearance.findMany({ select: { category_id: true } })
     * 
     */
    findMany<T extends category_clearanceFindManyArgs>(args?: SelectSubset<T, category_clearanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category_clearance.
     * @param {category_clearanceCreateArgs} args - Arguments to create a Category_clearance.
     * @example
     * // Create one Category_clearance
     * const Category_clearance = await prisma.category_clearance.create({
     *   data: {
     *     // ... data to create a Category_clearance
     *   }
     * })
     * 
     */
    create<T extends category_clearanceCreateArgs>(args: SelectSubset<T, category_clearanceCreateArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Category_clearances.
     * @param {category_clearanceCreateManyArgs} args - Arguments to create many Category_clearances.
     * @example
     * // Create many Category_clearances
     * const category_clearance = await prisma.category_clearance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends category_clearanceCreateManyArgs>(args?: SelectSubset<T, category_clearanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Category_clearance.
     * @param {category_clearanceDeleteArgs} args - Arguments to delete one Category_clearance.
     * @example
     * // Delete one Category_clearance
     * const Category_clearance = await prisma.category_clearance.delete({
     *   where: {
     *     // ... filter to delete one Category_clearance
     *   }
     * })
     * 
     */
    delete<T extends category_clearanceDeleteArgs>(args: SelectSubset<T, category_clearanceDeleteArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category_clearance.
     * @param {category_clearanceUpdateArgs} args - Arguments to update one Category_clearance.
     * @example
     * // Update one Category_clearance
     * const category_clearance = await prisma.category_clearance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends category_clearanceUpdateArgs>(args: SelectSubset<T, category_clearanceUpdateArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Category_clearances.
     * @param {category_clearanceDeleteManyArgs} args - Arguments to filter Category_clearances to delete.
     * @example
     * // Delete a few Category_clearances
     * const { count } = await prisma.category_clearance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends category_clearanceDeleteManyArgs>(args?: SelectSubset<T, category_clearanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Category_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Category_clearances
     * const category_clearance = await prisma.category_clearance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends category_clearanceUpdateManyArgs>(args: SelectSubset<T, category_clearanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Category_clearance.
     * @param {category_clearanceUpsertArgs} args - Arguments to update or create a Category_clearance.
     * @example
     * // Update or create a Category_clearance
     * const category_clearance = await prisma.category_clearance.upsert({
     *   create: {
     *     // ... data to create a Category_clearance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category_clearance we want to update
     *   }
     * })
     */
    upsert<T extends category_clearanceUpsertArgs>(args: SelectSubset<T, category_clearanceUpsertArgs<ExtArgs>>): Prisma__category_clearanceClient<$Result.GetResult<Prisma.$category_clearancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Category_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceCountArgs} args - Arguments to filter Category_clearances to count.
     * @example
     * // Count the number of Category_clearances
     * const count = await prisma.category_clearance.count({
     *   where: {
     *     // ... the filter for the Category_clearances we want to count
     *   }
     * })
    **/
    count<T extends category_clearanceCountArgs>(
      args?: Subset<T, category_clearanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Category_clearanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Category_clearanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Category_clearanceAggregateArgs>(args: Subset<T, Category_clearanceAggregateArgs>): Prisma.PrismaPromise<GetCategory_clearanceAggregateType<T>>

    /**
     * Group by Category_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {category_clearanceGroupByArgs} args - Group by arguments.
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
      T extends category_clearanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: category_clearanceGroupByArgs['orderBy'] }
        : { orderBy?: category_clearanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, category_clearanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategory_clearanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the category_clearance model
   */
  readonly fields: category_clearanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for category_clearance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__category_clearanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the category_clearance model
   */
  interface category_clearanceFieldRefs {
    readonly category_id: FieldRef<"category_clearance", 'Int'>
    readonly category_name: FieldRef<"category_clearance", 'String'>
    readonly category_number: FieldRef<"category_clearance", 'Int'>
    readonly category_keyword: FieldRef<"category_clearance", 'String'>
    readonly category_title: FieldRef<"category_clearance", 'String'>
    readonly category_description: FieldRef<"category_clearance", 'String'>
    readonly category_color: FieldRef<"category_clearance", 'String'>
    readonly category_picture: FieldRef<"category_clearance", 'String'>
    readonly category_status: FieldRef<"category_clearance", 'Int'>
    readonly users_action: FieldRef<"category_clearance", 'Int'>
    readonly created_at: FieldRef<"category_clearance", 'DateTime'>
    readonly updated_at: FieldRef<"category_clearance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * category_clearance findUnique
   */
  export type category_clearanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which category_clearance to fetch.
     */
    where: category_clearanceWhereUniqueInput
  }

  /**
   * category_clearance findUniqueOrThrow
   */
  export type category_clearanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which category_clearance to fetch.
     */
    where: category_clearanceWhereUniqueInput
  }

  /**
   * category_clearance findFirst
   */
  export type category_clearanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which category_clearance to fetch.
     */
    where?: category_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of category_clearances to fetch.
     */
    orderBy?: category_clearanceOrderByWithRelationInput | category_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for category_clearances.
     */
    cursor?: category_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` category_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` category_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of category_clearances.
     */
    distinct?: Category_clearanceScalarFieldEnum | Category_clearanceScalarFieldEnum[]
  }

  /**
   * category_clearance findFirstOrThrow
   */
  export type category_clearanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which category_clearance to fetch.
     */
    where?: category_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of category_clearances to fetch.
     */
    orderBy?: category_clearanceOrderByWithRelationInput | category_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for category_clearances.
     */
    cursor?: category_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` category_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` category_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of category_clearances.
     */
    distinct?: Category_clearanceScalarFieldEnum | Category_clearanceScalarFieldEnum[]
  }

  /**
   * category_clearance findMany
   */
  export type category_clearanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which category_clearances to fetch.
     */
    where?: category_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of category_clearances to fetch.
     */
    orderBy?: category_clearanceOrderByWithRelationInput | category_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing category_clearances.
     */
    cursor?: category_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` category_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` category_clearances.
     */
    skip?: number
    distinct?: Category_clearanceScalarFieldEnum | Category_clearanceScalarFieldEnum[]
  }

  /**
   * category_clearance create
   */
  export type category_clearanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to create a category_clearance.
     */
    data: XOR<category_clearanceCreateInput, category_clearanceUncheckedCreateInput>
  }

  /**
   * category_clearance createMany
   */
  export type category_clearanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many category_clearances.
     */
    data: category_clearanceCreateManyInput | category_clearanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * category_clearance update
   */
  export type category_clearanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to update a category_clearance.
     */
    data: XOR<category_clearanceUpdateInput, category_clearanceUncheckedUpdateInput>
    /**
     * Choose, which category_clearance to update.
     */
    where: category_clearanceWhereUniqueInput
  }

  /**
   * category_clearance updateMany
   */
  export type category_clearanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update category_clearances.
     */
    data: XOR<category_clearanceUpdateManyMutationInput, category_clearanceUncheckedUpdateManyInput>
    /**
     * Filter which category_clearances to update
     */
    where?: category_clearanceWhereInput
    /**
     * Limit how many category_clearances to update.
     */
    limit?: number
  }

  /**
   * category_clearance upsert
   */
  export type category_clearanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * The filter to search for the category_clearance to update in case it exists.
     */
    where: category_clearanceWhereUniqueInput
    /**
     * In case the category_clearance found by the `where` argument doesn't exist, create a new category_clearance with this data.
     */
    create: XOR<category_clearanceCreateInput, category_clearanceUncheckedCreateInput>
    /**
     * In case the category_clearance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<category_clearanceUpdateInput, category_clearanceUncheckedUpdateInput>
  }

  /**
   * category_clearance delete
   */
  export type category_clearanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
    /**
     * Filter which category_clearance to delete.
     */
    where: category_clearanceWhereUniqueInput
  }

  /**
   * category_clearance deleteMany
   */
  export type category_clearanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which category_clearances to delete
     */
    where?: category_clearanceWhereInput
    /**
     * Limit how many category_clearances to delete.
     */
    limit?: number
  }

  /**
   * category_clearance without action
   */
  export type category_clearanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the category_clearance
     */
    select?: category_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the category_clearance
     */
    omit?: category_clearanceOmit<ExtArgs> | null
  }


  /**
   * Model discountpercentage_clearance_tb
   */

  export type AggregateDiscountpercentage_clearance_tb = {
    _count: Discountpercentage_clearance_tbCountAggregateOutputType | null
    _avg: Discountpercentage_clearance_tbAvgAggregateOutputType | null
    _sum: Discountpercentage_clearance_tbSumAggregateOutputType | null
    _min: Discountpercentage_clearance_tbMinAggregateOutputType | null
    _max: Discountpercentage_clearance_tbMaxAggregateOutputType | null
  }

  export type Discountpercentage_clearance_tbAvgAggregateOutputType = {
    dcp_id: number | null
    product_id: number | null
  }

  export type Discountpercentage_clearance_tbSumAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
  }

  export type Discountpercentage_clearance_tbMinAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
    product_discount: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Discountpercentage_clearance_tbMaxAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
    product_discount: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Discountpercentage_clearance_tbCountAggregateOutputType = {
    dcp_id: number
    product_id: number
    product_discount: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type Discountpercentage_clearance_tbAvgAggregateInputType = {
    dcp_id?: true
    product_id?: true
  }

  export type Discountpercentage_clearance_tbSumAggregateInputType = {
    dcp_id?: true
    product_id?: true
  }

  export type Discountpercentage_clearance_tbMinAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Discountpercentage_clearance_tbMaxAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Discountpercentage_clearance_tbCountAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type Discountpercentage_clearance_tbAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discountpercentage_clearance_tb to aggregate.
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_clearance_tbs to fetch.
     */
    orderBy?: discountpercentage_clearance_tbOrderByWithRelationInput | discountpercentage_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: discountpercentage_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned discountpercentage_clearance_tbs
    **/
    _count?: true | Discountpercentage_clearance_tbCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Discountpercentage_clearance_tbAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Discountpercentage_clearance_tbSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Discountpercentage_clearance_tbMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Discountpercentage_clearance_tbMaxAggregateInputType
  }

  export type GetDiscountpercentage_clearance_tbAggregateType<T extends Discountpercentage_clearance_tbAggregateArgs> = {
        [P in keyof T & keyof AggregateDiscountpercentage_clearance_tb]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiscountpercentage_clearance_tb[P]>
      : GetScalarType<T[P], AggregateDiscountpercentage_clearance_tb[P]>
  }




  export type discountpercentage_clearance_tbGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: discountpercentage_clearance_tbWhereInput
    orderBy?: discountpercentage_clearance_tbOrderByWithAggregationInput | discountpercentage_clearance_tbOrderByWithAggregationInput[]
    by: Discountpercentage_clearance_tbScalarFieldEnum[] | Discountpercentage_clearance_tbScalarFieldEnum
    having?: discountpercentage_clearance_tbScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Discountpercentage_clearance_tbCountAggregateInputType | true
    _avg?: Discountpercentage_clearance_tbAvgAggregateInputType
    _sum?: Discountpercentage_clearance_tbSumAggregateInputType
    _min?: Discountpercentage_clearance_tbMinAggregateInputType
    _max?: Discountpercentage_clearance_tbMaxAggregateInputType
  }

  export type Discountpercentage_clearance_tbGroupByOutputType = {
    dcp_id: bigint
    product_id: number
    product_discount: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: Discountpercentage_clearance_tbCountAggregateOutputType | null
    _avg: Discountpercentage_clearance_tbAvgAggregateOutputType | null
    _sum: Discountpercentage_clearance_tbSumAggregateOutputType | null
    _min: Discountpercentage_clearance_tbMinAggregateOutputType | null
    _max: Discountpercentage_clearance_tbMaxAggregateOutputType | null
  }

  type GetDiscountpercentage_clearance_tbGroupByPayload<T extends discountpercentage_clearance_tbGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Discountpercentage_clearance_tbGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Discountpercentage_clearance_tbGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Discountpercentage_clearance_tbGroupByOutputType[P]>
            : GetScalarType<T[P], Discountpercentage_clearance_tbGroupByOutputType[P]>
        }
      >
    >


  export type discountpercentage_clearance_tbSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    dcp_id?: boolean
    product_id?: boolean
    product_discount?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["discountpercentage_clearance_tb"]>



  export type discountpercentage_clearance_tbSelectScalar = {
    dcp_id?: boolean
    product_id?: boolean
    product_discount?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type discountpercentage_clearance_tbOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"dcp_id" | "product_id" | "product_discount" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["discountpercentage_clearance_tb"]>

  export type $discountpercentage_clearance_tbPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "discountpercentage_clearance_tb"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      dcp_id: bigint
      product_id: number
      product_discount: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["discountpercentage_clearance_tb"]>
    composites: {}
  }

  type discountpercentage_clearance_tbGetPayload<S extends boolean | null | undefined | discountpercentage_clearance_tbDefaultArgs> = $Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload, S>

  type discountpercentage_clearance_tbCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<discountpercentage_clearance_tbFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Discountpercentage_clearance_tbCountAggregateInputType | true
    }

  export interface discountpercentage_clearance_tbDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['discountpercentage_clearance_tb'], meta: { name: 'discountpercentage_clearance_tb' } }
    /**
     * Find zero or one Discountpercentage_clearance_tb that matches the filter.
     * @param {discountpercentage_clearance_tbFindUniqueArgs} args - Arguments to find a Discountpercentage_clearance_tb
     * @example
     * // Get one Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends discountpercentage_clearance_tbFindUniqueArgs>(args: SelectSubset<T, discountpercentage_clearance_tbFindUniqueArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Discountpercentage_clearance_tb that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {discountpercentage_clearance_tbFindUniqueOrThrowArgs} args - Arguments to find a Discountpercentage_clearance_tb
     * @example
     * // Get one Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends discountpercentage_clearance_tbFindUniqueOrThrowArgs>(args: SelectSubset<T, discountpercentage_clearance_tbFindUniqueOrThrowArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discountpercentage_clearance_tb that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbFindFirstArgs} args - Arguments to find a Discountpercentage_clearance_tb
     * @example
     * // Get one Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends discountpercentage_clearance_tbFindFirstArgs>(args?: SelectSubset<T, discountpercentage_clearance_tbFindFirstArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discountpercentage_clearance_tb that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbFindFirstOrThrowArgs} args - Arguments to find a Discountpercentage_clearance_tb
     * @example
     * // Get one Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends discountpercentage_clearance_tbFindFirstOrThrowArgs>(args?: SelectSubset<T, discountpercentage_clearance_tbFindFirstOrThrowArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Discountpercentage_clearance_tbs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Discountpercentage_clearance_tbs
     * const discountpercentage_clearance_tbs = await prisma.discountpercentage_clearance_tb.findMany()
     * 
     * // Get first 10 Discountpercentage_clearance_tbs
     * const discountpercentage_clearance_tbs = await prisma.discountpercentage_clearance_tb.findMany({ take: 10 })
     * 
     * // Only select the `dcp_id`
     * const discountpercentage_clearance_tbWithDcp_idOnly = await prisma.discountpercentage_clearance_tb.findMany({ select: { dcp_id: true } })
     * 
     */
    findMany<T extends discountpercentage_clearance_tbFindManyArgs>(args?: SelectSubset<T, discountpercentage_clearance_tbFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Discountpercentage_clearance_tb.
     * @param {discountpercentage_clearance_tbCreateArgs} args - Arguments to create a Discountpercentage_clearance_tb.
     * @example
     * // Create one Discountpercentage_clearance_tb
     * const Discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.create({
     *   data: {
     *     // ... data to create a Discountpercentage_clearance_tb
     *   }
     * })
     * 
     */
    create<T extends discountpercentage_clearance_tbCreateArgs>(args: SelectSubset<T, discountpercentage_clearance_tbCreateArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Discountpercentage_clearance_tbs.
     * @param {discountpercentage_clearance_tbCreateManyArgs} args - Arguments to create many Discountpercentage_clearance_tbs.
     * @example
     * // Create many Discountpercentage_clearance_tbs
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends discountpercentage_clearance_tbCreateManyArgs>(args?: SelectSubset<T, discountpercentage_clearance_tbCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Discountpercentage_clearance_tb.
     * @param {discountpercentage_clearance_tbDeleteArgs} args - Arguments to delete one Discountpercentage_clearance_tb.
     * @example
     * // Delete one Discountpercentage_clearance_tb
     * const Discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.delete({
     *   where: {
     *     // ... filter to delete one Discountpercentage_clearance_tb
     *   }
     * })
     * 
     */
    delete<T extends discountpercentage_clearance_tbDeleteArgs>(args: SelectSubset<T, discountpercentage_clearance_tbDeleteArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Discountpercentage_clearance_tb.
     * @param {discountpercentage_clearance_tbUpdateArgs} args - Arguments to update one Discountpercentage_clearance_tb.
     * @example
     * // Update one Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends discountpercentage_clearance_tbUpdateArgs>(args: SelectSubset<T, discountpercentage_clearance_tbUpdateArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Discountpercentage_clearance_tbs.
     * @param {discountpercentage_clearance_tbDeleteManyArgs} args - Arguments to filter Discountpercentage_clearance_tbs to delete.
     * @example
     * // Delete a few Discountpercentage_clearance_tbs
     * const { count } = await prisma.discountpercentage_clearance_tb.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends discountpercentage_clearance_tbDeleteManyArgs>(args?: SelectSubset<T, discountpercentage_clearance_tbDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Discountpercentage_clearance_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Discountpercentage_clearance_tbs
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends discountpercentage_clearance_tbUpdateManyArgs>(args: SelectSubset<T, discountpercentage_clearance_tbUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Discountpercentage_clearance_tb.
     * @param {discountpercentage_clearance_tbUpsertArgs} args - Arguments to update or create a Discountpercentage_clearance_tb.
     * @example
     * // Update or create a Discountpercentage_clearance_tb
     * const discountpercentage_clearance_tb = await prisma.discountpercentage_clearance_tb.upsert({
     *   create: {
     *     // ... data to create a Discountpercentage_clearance_tb
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Discountpercentage_clearance_tb we want to update
     *   }
     * })
     */
    upsert<T extends discountpercentage_clearance_tbUpsertArgs>(args: SelectSubset<T, discountpercentage_clearance_tbUpsertArgs<ExtArgs>>): Prisma__discountpercentage_clearance_tbClient<$Result.GetResult<Prisma.$discountpercentage_clearance_tbPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Discountpercentage_clearance_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbCountArgs} args - Arguments to filter Discountpercentage_clearance_tbs to count.
     * @example
     * // Count the number of Discountpercentage_clearance_tbs
     * const count = await prisma.discountpercentage_clearance_tb.count({
     *   where: {
     *     // ... the filter for the Discountpercentage_clearance_tbs we want to count
     *   }
     * })
    **/
    count<T extends discountpercentage_clearance_tbCountArgs>(
      args?: Subset<T, discountpercentage_clearance_tbCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Discountpercentage_clearance_tbCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Discountpercentage_clearance_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Discountpercentage_clearance_tbAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Discountpercentage_clearance_tbAggregateArgs>(args: Subset<T, Discountpercentage_clearance_tbAggregateArgs>): Prisma.PrismaPromise<GetDiscountpercentage_clearance_tbAggregateType<T>>

    /**
     * Group by Discountpercentage_clearance_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_clearance_tbGroupByArgs} args - Group by arguments.
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
      T extends discountpercentage_clearance_tbGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: discountpercentage_clearance_tbGroupByArgs['orderBy'] }
        : { orderBy?: discountpercentage_clearance_tbGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, discountpercentage_clearance_tbGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscountpercentage_clearance_tbGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the discountpercentage_clearance_tb model
   */
  readonly fields: discountpercentage_clearance_tbFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for discountpercentage_clearance_tb.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__discountpercentage_clearance_tbClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the discountpercentage_clearance_tb model
   */
  interface discountpercentage_clearance_tbFieldRefs {
    readonly dcp_id: FieldRef<"discountpercentage_clearance_tb", 'BigInt'>
    readonly product_id: FieldRef<"discountpercentage_clearance_tb", 'Int'>
    readonly product_discount: FieldRef<"discountpercentage_clearance_tb", 'String'>
    readonly create_date: FieldRef<"discountpercentage_clearance_tb", 'DateTime'>
    readonly create_name: FieldRef<"discountpercentage_clearance_tb", 'String'>
    readonly update_date: FieldRef<"discountpercentage_clearance_tb", 'DateTime'>
    readonly update_name: FieldRef<"discountpercentage_clearance_tb", 'String'>
  }
    

  // Custom InputTypes
  /**
   * discountpercentage_clearance_tb findUnique
   */
  export type discountpercentage_clearance_tbFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_clearance_tb to fetch.
     */
    where: discountpercentage_clearance_tbWhereUniqueInput
  }

  /**
   * discountpercentage_clearance_tb findUniqueOrThrow
   */
  export type discountpercentage_clearance_tbFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_clearance_tb to fetch.
     */
    where: discountpercentage_clearance_tbWhereUniqueInput
  }

  /**
   * discountpercentage_clearance_tb findFirst
   */
  export type discountpercentage_clearance_tbFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_clearance_tb to fetch.
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_clearance_tbs to fetch.
     */
    orderBy?: discountpercentage_clearance_tbOrderByWithRelationInput | discountpercentage_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discountpercentage_clearance_tbs.
     */
    cursor?: discountpercentage_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discountpercentage_clearance_tbs.
     */
    distinct?: Discountpercentage_clearance_tbScalarFieldEnum | Discountpercentage_clearance_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_clearance_tb findFirstOrThrow
   */
  export type discountpercentage_clearance_tbFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_clearance_tb to fetch.
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_clearance_tbs to fetch.
     */
    orderBy?: discountpercentage_clearance_tbOrderByWithRelationInput | discountpercentage_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discountpercentage_clearance_tbs.
     */
    cursor?: discountpercentage_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discountpercentage_clearance_tbs.
     */
    distinct?: Discountpercentage_clearance_tbScalarFieldEnum | Discountpercentage_clearance_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_clearance_tb findMany
   */
  export type discountpercentage_clearance_tbFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_clearance_tbs to fetch.
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_clearance_tbs to fetch.
     */
    orderBy?: discountpercentage_clearance_tbOrderByWithRelationInput | discountpercentage_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing discountpercentage_clearance_tbs.
     */
    cursor?: discountpercentage_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_clearance_tbs.
     */
    skip?: number
    distinct?: Discountpercentage_clearance_tbScalarFieldEnum | Discountpercentage_clearance_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_clearance_tb create
   */
  export type discountpercentage_clearance_tbCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * The data needed to create a discountpercentage_clearance_tb.
     */
    data: XOR<discountpercentage_clearance_tbCreateInput, discountpercentage_clearance_tbUncheckedCreateInput>
  }

  /**
   * discountpercentage_clearance_tb createMany
   */
  export type discountpercentage_clearance_tbCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many discountpercentage_clearance_tbs.
     */
    data: discountpercentage_clearance_tbCreateManyInput | discountpercentage_clearance_tbCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * discountpercentage_clearance_tb update
   */
  export type discountpercentage_clearance_tbUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * The data needed to update a discountpercentage_clearance_tb.
     */
    data: XOR<discountpercentage_clearance_tbUpdateInput, discountpercentage_clearance_tbUncheckedUpdateInput>
    /**
     * Choose, which discountpercentage_clearance_tb to update.
     */
    where: discountpercentage_clearance_tbWhereUniqueInput
  }

  /**
   * discountpercentage_clearance_tb updateMany
   */
  export type discountpercentage_clearance_tbUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update discountpercentage_clearance_tbs.
     */
    data: XOR<discountpercentage_clearance_tbUpdateManyMutationInput, discountpercentage_clearance_tbUncheckedUpdateManyInput>
    /**
     * Filter which discountpercentage_clearance_tbs to update
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * Limit how many discountpercentage_clearance_tbs to update.
     */
    limit?: number
  }

  /**
   * discountpercentage_clearance_tb upsert
   */
  export type discountpercentage_clearance_tbUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * The filter to search for the discountpercentage_clearance_tb to update in case it exists.
     */
    where: discountpercentage_clearance_tbWhereUniqueInput
    /**
     * In case the discountpercentage_clearance_tb found by the `where` argument doesn't exist, create a new discountpercentage_clearance_tb with this data.
     */
    create: XOR<discountpercentage_clearance_tbCreateInput, discountpercentage_clearance_tbUncheckedCreateInput>
    /**
     * In case the discountpercentage_clearance_tb was found with the provided `where` argument, update it with this data.
     */
    update: XOR<discountpercentage_clearance_tbUpdateInput, discountpercentage_clearance_tbUncheckedUpdateInput>
  }

  /**
   * discountpercentage_clearance_tb delete
   */
  export type discountpercentage_clearance_tbDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter which discountpercentage_clearance_tb to delete.
     */
    where: discountpercentage_clearance_tbWhereUniqueInput
  }

  /**
   * discountpercentage_clearance_tb deleteMany
   */
  export type discountpercentage_clearance_tbDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discountpercentage_clearance_tbs to delete
     */
    where?: discountpercentage_clearance_tbWhereInput
    /**
     * Limit how many discountpercentage_clearance_tbs to delete.
     */
    limit?: number
  }

  /**
   * discountpercentage_clearance_tb without action
   */
  export type discountpercentage_clearance_tbDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_clearance_tb
     */
    select?: discountpercentage_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_clearance_tb
     */
    omit?: discountpercentage_clearance_tbOmit<ExtArgs> | null
  }


  /**
   * Model discountpercentage_tb
   */

  export type AggregateDiscountpercentage_tb = {
    _count: Discountpercentage_tbCountAggregateOutputType | null
    _avg: Discountpercentage_tbAvgAggregateOutputType | null
    _sum: Discountpercentage_tbSumAggregateOutputType | null
    _min: Discountpercentage_tbMinAggregateOutputType | null
    _max: Discountpercentage_tbMaxAggregateOutputType | null
  }

  export type Discountpercentage_tbAvgAggregateOutputType = {
    dcp_id: number | null
    product_id: number | null
  }

  export type Discountpercentage_tbSumAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
  }

  export type Discountpercentage_tbMinAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
    product_discount: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Discountpercentage_tbMaxAggregateOutputType = {
    dcp_id: bigint | null
    product_id: number | null
    product_discount: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Discountpercentage_tbCountAggregateOutputType = {
    dcp_id: number
    product_id: number
    product_discount: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type Discountpercentage_tbAvgAggregateInputType = {
    dcp_id?: true
    product_id?: true
  }

  export type Discountpercentage_tbSumAggregateInputType = {
    dcp_id?: true
    product_id?: true
  }

  export type Discountpercentage_tbMinAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Discountpercentage_tbMaxAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Discountpercentage_tbCountAggregateInputType = {
    dcp_id?: true
    product_id?: true
    product_discount?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type Discountpercentage_tbAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discountpercentage_tb to aggregate.
     */
    where?: discountpercentage_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_tbs to fetch.
     */
    orderBy?: discountpercentage_tbOrderByWithRelationInput | discountpercentage_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: discountpercentage_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned discountpercentage_tbs
    **/
    _count?: true | Discountpercentage_tbCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Discountpercentage_tbAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Discountpercentage_tbSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Discountpercentage_tbMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Discountpercentage_tbMaxAggregateInputType
  }

  export type GetDiscountpercentage_tbAggregateType<T extends Discountpercentage_tbAggregateArgs> = {
        [P in keyof T & keyof AggregateDiscountpercentage_tb]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiscountpercentage_tb[P]>
      : GetScalarType<T[P], AggregateDiscountpercentage_tb[P]>
  }




  export type discountpercentage_tbGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: discountpercentage_tbWhereInput
    orderBy?: discountpercentage_tbOrderByWithAggregationInput | discountpercentage_tbOrderByWithAggregationInput[]
    by: Discountpercentage_tbScalarFieldEnum[] | Discountpercentage_tbScalarFieldEnum
    having?: discountpercentage_tbScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Discountpercentage_tbCountAggregateInputType | true
    _avg?: Discountpercentage_tbAvgAggregateInputType
    _sum?: Discountpercentage_tbSumAggregateInputType
    _min?: Discountpercentage_tbMinAggregateInputType
    _max?: Discountpercentage_tbMaxAggregateInputType
  }

  export type Discountpercentage_tbGroupByOutputType = {
    dcp_id: bigint
    product_id: number
    product_discount: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: Discountpercentage_tbCountAggregateOutputType | null
    _avg: Discountpercentage_tbAvgAggregateOutputType | null
    _sum: Discountpercentage_tbSumAggregateOutputType | null
    _min: Discountpercentage_tbMinAggregateOutputType | null
    _max: Discountpercentage_tbMaxAggregateOutputType | null
  }

  type GetDiscountpercentage_tbGroupByPayload<T extends discountpercentage_tbGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Discountpercentage_tbGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Discountpercentage_tbGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Discountpercentage_tbGroupByOutputType[P]>
            : GetScalarType<T[P], Discountpercentage_tbGroupByOutputType[P]>
        }
      >
    >


  export type discountpercentage_tbSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    dcp_id?: boolean
    product_id?: boolean
    product_discount?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["discountpercentage_tb"]>



  export type discountpercentage_tbSelectScalar = {
    dcp_id?: boolean
    product_id?: boolean
    product_discount?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type discountpercentage_tbOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"dcp_id" | "product_id" | "product_discount" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["discountpercentage_tb"]>

  export type $discountpercentage_tbPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "discountpercentage_tb"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      dcp_id: bigint
      product_id: number
      product_discount: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["discountpercentage_tb"]>
    composites: {}
  }

  type discountpercentage_tbGetPayload<S extends boolean | null | undefined | discountpercentage_tbDefaultArgs> = $Result.GetResult<Prisma.$discountpercentage_tbPayload, S>

  type discountpercentage_tbCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<discountpercentage_tbFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Discountpercentage_tbCountAggregateInputType | true
    }

  export interface discountpercentage_tbDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['discountpercentage_tb'], meta: { name: 'discountpercentage_tb' } }
    /**
     * Find zero or one Discountpercentage_tb that matches the filter.
     * @param {discountpercentage_tbFindUniqueArgs} args - Arguments to find a Discountpercentage_tb
     * @example
     * // Get one Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends discountpercentage_tbFindUniqueArgs>(args: SelectSubset<T, discountpercentage_tbFindUniqueArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Discountpercentage_tb that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {discountpercentage_tbFindUniqueOrThrowArgs} args - Arguments to find a Discountpercentage_tb
     * @example
     * // Get one Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends discountpercentage_tbFindUniqueOrThrowArgs>(args: SelectSubset<T, discountpercentage_tbFindUniqueOrThrowArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discountpercentage_tb that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbFindFirstArgs} args - Arguments to find a Discountpercentage_tb
     * @example
     * // Get one Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends discountpercentage_tbFindFirstArgs>(args?: SelectSubset<T, discountpercentage_tbFindFirstArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discountpercentage_tb that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbFindFirstOrThrowArgs} args - Arguments to find a Discountpercentage_tb
     * @example
     * // Get one Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends discountpercentage_tbFindFirstOrThrowArgs>(args?: SelectSubset<T, discountpercentage_tbFindFirstOrThrowArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Discountpercentage_tbs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Discountpercentage_tbs
     * const discountpercentage_tbs = await prisma.discountpercentage_tb.findMany()
     * 
     * // Get first 10 Discountpercentage_tbs
     * const discountpercentage_tbs = await prisma.discountpercentage_tb.findMany({ take: 10 })
     * 
     * // Only select the `dcp_id`
     * const discountpercentage_tbWithDcp_idOnly = await prisma.discountpercentage_tb.findMany({ select: { dcp_id: true } })
     * 
     */
    findMany<T extends discountpercentage_tbFindManyArgs>(args?: SelectSubset<T, discountpercentage_tbFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Discountpercentage_tb.
     * @param {discountpercentage_tbCreateArgs} args - Arguments to create a Discountpercentage_tb.
     * @example
     * // Create one Discountpercentage_tb
     * const Discountpercentage_tb = await prisma.discountpercentage_tb.create({
     *   data: {
     *     // ... data to create a Discountpercentage_tb
     *   }
     * })
     * 
     */
    create<T extends discountpercentage_tbCreateArgs>(args: SelectSubset<T, discountpercentage_tbCreateArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Discountpercentage_tbs.
     * @param {discountpercentage_tbCreateManyArgs} args - Arguments to create many Discountpercentage_tbs.
     * @example
     * // Create many Discountpercentage_tbs
     * const discountpercentage_tb = await prisma.discountpercentage_tb.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends discountpercentage_tbCreateManyArgs>(args?: SelectSubset<T, discountpercentage_tbCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Discountpercentage_tb.
     * @param {discountpercentage_tbDeleteArgs} args - Arguments to delete one Discountpercentage_tb.
     * @example
     * // Delete one Discountpercentage_tb
     * const Discountpercentage_tb = await prisma.discountpercentage_tb.delete({
     *   where: {
     *     // ... filter to delete one Discountpercentage_tb
     *   }
     * })
     * 
     */
    delete<T extends discountpercentage_tbDeleteArgs>(args: SelectSubset<T, discountpercentage_tbDeleteArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Discountpercentage_tb.
     * @param {discountpercentage_tbUpdateArgs} args - Arguments to update one Discountpercentage_tb.
     * @example
     * // Update one Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends discountpercentage_tbUpdateArgs>(args: SelectSubset<T, discountpercentage_tbUpdateArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Discountpercentage_tbs.
     * @param {discountpercentage_tbDeleteManyArgs} args - Arguments to filter Discountpercentage_tbs to delete.
     * @example
     * // Delete a few Discountpercentage_tbs
     * const { count } = await prisma.discountpercentage_tb.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends discountpercentage_tbDeleteManyArgs>(args?: SelectSubset<T, discountpercentage_tbDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Discountpercentage_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Discountpercentage_tbs
     * const discountpercentage_tb = await prisma.discountpercentage_tb.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends discountpercentage_tbUpdateManyArgs>(args: SelectSubset<T, discountpercentage_tbUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Discountpercentage_tb.
     * @param {discountpercentage_tbUpsertArgs} args - Arguments to update or create a Discountpercentage_tb.
     * @example
     * // Update or create a Discountpercentage_tb
     * const discountpercentage_tb = await prisma.discountpercentage_tb.upsert({
     *   create: {
     *     // ... data to create a Discountpercentage_tb
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Discountpercentage_tb we want to update
     *   }
     * })
     */
    upsert<T extends discountpercentage_tbUpsertArgs>(args: SelectSubset<T, discountpercentage_tbUpsertArgs<ExtArgs>>): Prisma__discountpercentage_tbClient<$Result.GetResult<Prisma.$discountpercentage_tbPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Discountpercentage_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbCountArgs} args - Arguments to filter Discountpercentage_tbs to count.
     * @example
     * // Count the number of Discountpercentage_tbs
     * const count = await prisma.discountpercentage_tb.count({
     *   where: {
     *     // ... the filter for the Discountpercentage_tbs we want to count
     *   }
     * })
    **/
    count<T extends discountpercentage_tbCountArgs>(
      args?: Subset<T, discountpercentage_tbCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Discountpercentage_tbCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Discountpercentage_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Discountpercentage_tbAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Discountpercentage_tbAggregateArgs>(args: Subset<T, Discountpercentage_tbAggregateArgs>): Prisma.PrismaPromise<GetDiscountpercentage_tbAggregateType<T>>

    /**
     * Group by Discountpercentage_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {discountpercentage_tbGroupByArgs} args - Group by arguments.
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
      T extends discountpercentage_tbGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: discountpercentage_tbGroupByArgs['orderBy'] }
        : { orderBy?: discountpercentage_tbGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, discountpercentage_tbGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscountpercentage_tbGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the discountpercentage_tb model
   */
  readonly fields: discountpercentage_tbFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for discountpercentage_tb.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__discountpercentage_tbClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the discountpercentage_tb model
   */
  interface discountpercentage_tbFieldRefs {
    readonly dcp_id: FieldRef<"discountpercentage_tb", 'BigInt'>
    readonly product_id: FieldRef<"discountpercentage_tb", 'Int'>
    readonly product_discount: FieldRef<"discountpercentage_tb", 'String'>
    readonly create_date: FieldRef<"discountpercentage_tb", 'DateTime'>
    readonly create_name: FieldRef<"discountpercentage_tb", 'String'>
    readonly update_date: FieldRef<"discountpercentage_tb", 'DateTime'>
    readonly update_name: FieldRef<"discountpercentage_tb", 'String'>
  }
    

  // Custom InputTypes
  /**
   * discountpercentage_tb findUnique
   */
  export type discountpercentage_tbFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_tb to fetch.
     */
    where: discountpercentage_tbWhereUniqueInput
  }

  /**
   * discountpercentage_tb findUniqueOrThrow
   */
  export type discountpercentage_tbFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_tb to fetch.
     */
    where: discountpercentage_tbWhereUniqueInput
  }

  /**
   * discountpercentage_tb findFirst
   */
  export type discountpercentage_tbFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_tb to fetch.
     */
    where?: discountpercentage_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_tbs to fetch.
     */
    orderBy?: discountpercentage_tbOrderByWithRelationInput | discountpercentage_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discountpercentage_tbs.
     */
    cursor?: discountpercentage_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discountpercentage_tbs.
     */
    distinct?: Discountpercentage_tbScalarFieldEnum | Discountpercentage_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_tb findFirstOrThrow
   */
  export type discountpercentage_tbFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_tb to fetch.
     */
    where?: discountpercentage_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_tbs to fetch.
     */
    orderBy?: discountpercentage_tbOrderByWithRelationInput | discountpercentage_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for discountpercentage_tbs.
     */
    cursor?: discountpercentage_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of discountpercentage_tbs.
     */
    distinct?: Discountpercentage_tbScalarFieldEnum | Discountpercentage_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_tb findMany
   */
  export type discountpercentage_tbFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter, which discountpercentage_tbs to fetch.
     */
    where?: discountpercentage_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of discountpercentage_tbs to fetch.
     */
    orderBy?: discountpercentage_tbOrderByWithRelationInput | discountpercentage_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing discountpercentage_tbs.
     */
    cursor?: discountpercentage_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` discountpercentage_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` discountpercentage_tbs.
     */
    skip?: number
    distinct?: Discountpercentage_tbScalarFieldEnum | Discountpercentage_tbScalarFieldEnum[]
  }

  /**
   * discountpercentage_tb create
   */
  export type discountpercentage_tbCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * The data needed to create a discountpercentage_tb.
     */
    data: XOR<discountpercentage_tbCreateInput, discountpercentage_tbUncheckedCreateInput>
  }

  /**
   * discountpercentage_tb createMany
   */
  export type discountpercentage_tbCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many discountpercentage_tbs.
     */
    data: discountpercentage_tbCreateManyInput | discountpercentage_tbCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * discountpercentage_tb update
   */
  export type discountpercentage_tbUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * The data needed to update a discountpercentage_tb.
     */
    data: XOR<discountpercentage_tbUpdateInput, discountpercentage_tbUncheckedUpdateInput>
    /**
     * Choose, which discountpercentage_tb to update.
     */
    where: discountpercentage_tbWhereUniqueInput
  }

  /**
   * discountpercentage_tb updateMany
   */
  export type discountpercentage_tbUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update discountpercentage_tbs.
     */
    data: XOR<discountpercentage_tbUpdateManyMutationInput, discountpercentage_tbUncheckedUpdateManyInput>
    /**
     * Filter which discountpercentage_tbs to update
     */
    where?: discountpercentage_tbWhereInput
    /**
     * Limit how many discountpercentage_tbs to update.
     */
    limit?: number
  }

  /**
   * discountpercentage_tb upsert
   */
  export type discountpercentage_tbUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * The filter to search for the discountpercentage_tb to update in case it exists.
     */
    where: discountpercentage_tbWhereUniqueInput
    /**
     * In case the discountpercentage_tb found by the `where` argument doesn't exist, create a new discountpercentage_tb with this data.
     */
    create: XOR<discountpercentage_tbCreateInput, discountpercentage_tbUncheckedCreateInput>
    /**
     * In case the discountpercentage_tb was found with the provided `where` argument, update it with this data.
     */
    update: XOR<discountpercentage_tbUpdateInput, discountpercentage_tbUncheckedUpdateInput>
  }

  /**
   * discountpercentage_tb delete
   */
  export type discountpercentage_tbDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
    /**
     * Filter which discountpercentage_tb to delete.
     */
    where: discountpercentage_tbWhereUniqueInput
  }

  /**
   * discountpercentage_tb deleteMany
   */
  export type discountpercentage_tbDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which discountpercentage_tbs to delete
     */
    where?: discountpercentage_tbWhereInput
    /**
     * Limit how many discountpercentage_tbs to delete.
     */
    limit?: number
  }

  /**
   * discountpercentage_tb without action
   */
  export type discountpercentage_tbDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the discountpercentage_tb
     */
    select?: discountpercentage_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the discountpercentage_tb
     */
    omit?: discountpercentage_tbOmit<ExtArgs> | null
  }


  /**
   * Model more_pictures_clearance
   */

  export type AggregateMore_pictures_clearance = {
    _count: More_pictures_clearanceCountAggregateOutputType | null
    _avg: More_pictures_clearanceAvgAggregateOutputType | null
    _sum: More_pictures_clearanceSumAggregateOutputType | null
    _min: More_pictures_clearanceMinAggregateOutputType | null
    _max: More_pictures_clearanceMaxAggregateOutputType | null
  }

  export type More_pictures_clearanceAvgAggregateOutputType = {
    mpc_id: number | null
    product_id: number | null
  }

  export type More_pictures_clearanceSumAggregateOutputType = {
    mpc_id: bigint | null
    product_id: number | null
  }

  export type More_pictures_clearanceMinAggregateOutputType = {
    mpc_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_pictures_clearanceMaxAggregateOutputType = {
    mpc_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_pictures_clearanceCountAggregateOutputType = {
    mpc_id: number
    product_id: number
    product_picture: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type More_pictures_clearanceAvgAggregateInputType = {
    mpc_id?: true
    product_id?: true
  }

  export type More_pictures_clearanceSumAggregateInputType = {
    mpc_id?: true
    product_id?: true
  }

  export type More_pictures_clearanceMinAggregateInputType = {
    mpc_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_pictures_clearanceMaxAggregateInputType = {
    mpc_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_pictures_clearanceCountAggregateInputType = {
    mpc_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type More_pictures_clearanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures_clearance to aggregate.
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_clearances to fetch.
     */
    orderBy?: more_pictures_clearanceOrderByWithRelationInput | more_pictures_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: more_pictures_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned more_pictures_clearances
    **/
    _count?: true | More_pictures_clearanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: More_pictures_clearanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: More_pictures_clearanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: More_pictures_clearanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: More_pictures_clearanceMaxAggregateInputType
  }

  export type GetMore_pictures_clearanceAggregateType<T extends More_pictures_clearanceAggregateArgs> = {
        [P in keyof T & keyof AggregateMore_pictures_clearance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMore_pictures_clearance[P]>
      : GetScalarType<T[P], AggregateMore_pictures_clearance[P]>
  }




  export type more_pictures_clearanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: more_pictures_clearanceWhereInput
    orderBy?: more_pictures_clearanceOrderByWithAggregationInput | more_pictures_clearanceOrderByWithAggregationInput[]
    by: More_pictures_clearanceScalarFieldEnum[] | More_pictures_clearanceScalarFieldEnum
    having?: more_pictures_clearanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: More_pictures_clearanceCountAggregateInputType | true
    _avg?: More_pictures_clearanceAvgAggregateInputType
    _sum?: More_pictures_clearanceSumAggregateInputType
    _min?: More_pictures_clearanceMinAggregateInputType
    _max?: More_pictures_clearanceMaxAggregateInputType
  }

  export type More_pictures_clearanceGroupByOutputType = {
    mpc_id: bigint
    product_id: number
    product_picture: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: More_pictures_clearanceCountAggregateOutputType | null
    _avg: More_pictures_clearanceAvgAggregateOutputType | null
    _sum: More_pictures_clearanceSumAggregateOutputType | null
    _min: More_pictures_clearanceMinAggregateOutputType | null
    _max: More_pictures_clearanceMaxAggregateOutputType | null
  }

  type GetMore_pictures_clearanceGroupByPayload<T extends more_pictures_clearanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<More_pictures_clearanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof More_pictures_clearanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], More_pictures_clearanceGroupByOutputType[P]>
            : GetScalarType<T[P], More_pictures_clearanceGroupByOutputType[P]>
        }
      >
    >


  export type more_pictures_clearanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mpc_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["more_pictures_clearance"]>



  export type more_pictures_clearanceSelectScalar = {
    mpc_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type more_pictures_clearanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"mpc_id" | "product_id" | "product_picture" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["more_pictures_clearance"]>

  export type $more_pictures_clearancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "more_pictures_clearance"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      mpc_id: bigint
      product_id: number
      product_picture: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["more_pictures_clearance"]>
    composites: {}
  }

  type more_pictures_clearanceGetPayload<S extends boolean | null | undefined | more_pictures_clearanceDefaultArgs> = $Result.GetResult<Prisma.$more_pictures_clearancePayload, S>

  type more_pictures_clearanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<more_pictures_clearanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: More_pictures_clearanceCountAggregateInputType | true
    }

  export interface more_pictures_clearanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['more_pictures_clearance'], meta: { name: 'more_pictures_clearance' } }
    /**
     * Find zero or one More_pictures_clearance that matches the filter.
     * @param {more_pictures_clearanceFindUniqueArgs} args - Arguments to find a More_pictures_clearance
     * @example
     * // Get one More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends more_pictures_clearanceFindUniqueArgs>(args: SelectSubset<T, more_pictures_clearanceFindUniqueArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one More_pictures_clearance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {more_pictures_clearanceFindUniqueOrThrowArgs} args - Arguments to find a More_pictures_clearance
     * @example
     * // Get one More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends more_pictures_clearanceFindUniqueOrThrowArgs>(args: SelectSubset<T, more_pictures_clearanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures_clearance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceFindFirstArgs} args - Arguments to find a More_pictures_clearance
     * @example
     * // Get one More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends more_pictures_clearanceFindFirstArgs>(args?: SelectSubset<T, more_pictures_clearanceFindFirstArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures_clearance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceFindFirstOrThrowArgs} args - Arguments to find a More_pictures_clearance
     * @example
     * // Get one More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends more_pictures_clearanceFindFirstOrThrowArgs>(args?: SelectSubset<T, more_pictures_clearanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more More_pictures_clearances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all More_pictures_clearances
     * const more_pictures_clearances = await prisma.more_pictures_clearance.findMany()
     * 
     * // Get first 10 More_pictures_clearances
     * const more_pictures_clearances = await prisma.more_pictures_clearance.findMany({ take: 10 })
     * 
     * // Only select the `mpc_id`
     * const more_pictures_clearanceWithMpc_idOnly = await prisma.more_pictures_clearance.findMany({ select: { mpc_id: true } })
     * 
     */
    findMany<T extends more_pictures_clearanceFindManyArgs>(args?: SelectSubset<T, more_pictures_clearanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a More_pictures_clearance.
     * @param {more_pictures_clearanceCreateArgs} args - Arguments to create a More_pictures_clearance.
     * @example
     * // Create one More_pictures_clearance
     * const More_pictures_clearance = await prisma.more_pictures_clearance.create({
     *   data: {
     *     // ... data to create a More_pictures_clearance
     *   }
     * })
     * 
     */
    create<T extends more_pictures_clearanceCreateArgs>(args: SelectSubset<T, more_pictures_clearanceCreateArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many More_pictures_clearances.
     * @param {more_pictures_clearanceCreateManyArgs} args - Arguments to create many More_pictures_clearances.
     * @example
     * // Create many More_pictures_clearances
     * const more_pictures_clearance = await prisma.more_pictures_clearance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends more_pictures_clearanceCreateManyArgs>(args?: SelectSubset<T, more_pictures_clearanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a More_pictures_clearance.
     * @param {more_pictures_clearanceDeleteArgs} args - Arguments to delete one More_pictures_clearance.
     * @example
     * // Delete one More_pictures_clearance
     * const More_pictures_clearance = await prisma.more_pictures_clearance.delete({
     *   where: {
     *     // ... filter to delete one More_pictures_clearance
     *   }
     * })
     * 
     */
    delete<T extends more_pictures_clearanceDeleteArgs>(args: SelectSubset<T, more_pictures_clearanceDeleteArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one More_pictures_clearance.
     * @param {more_pictures_clearanceUpdateArgs} args - Arguments to update one More_pictures_clearance.
     * @example
     * // Update one More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends more_pictures_clearanceUpdateArgs>(args: SelectSubset<T, more_pictures_clearanceUpdateArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more More_pictures_clearances.
     * @param {more_pictures_clearanceDeleteManyArgs} args - Arguments to filter More_pictures_clearances to delete.
     * @example
     * // Delete a few More_pictures_clearances
     * const { count } = await prisma.more_pictures_clearance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends more_pictures_clearanceDeleteManyArgs>(args?: SelectSubset<T, more_pictures_clearanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more More_pictures_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many More_pictures_clearances
     * const more_pictures_clearance = await prisma.more_pictures_clearance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends more_pictures_clearanceUpdateManyArgs>(args: SelectSubset<T, more_pictures_clearanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one More_pictures_clearance.
     * @param {more_pictures_clearanceUpsertArgs} args - Arguments to update or create a More_pictures_clearance.
     * @example
     * // Update or create a More_pictures_clearance
     * const more_pictures_clearance = await prisma.more_pictures_clearance.upsert({
     *   create: {
     *     // ... data to create a More_pictures_clearance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the More_pictures_clearance we want to update
     *   }
     * })
     */
    upsert<T extends more_pictures_clearanceUpsertArgs>(args: SelectSubset<T, more_pictures_clearanceUpsertArgs<ExtArgs>>): Prisma__more_pictures_clearanceClient<$Result.GetResult<Prisma.$more_pictures_clearancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of More_pictures_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceCountArgs} args - Arguments to filter More_pictures_clearances to count.
     * @example
     * // Count the number of More_pictures_clearances
     * const count = await prisma.more_pictures_clearance.count({
     *   where: {
     *     // ... the filter for the More_pictures_clearances we want to count
     *   }
     * })
    **/
    count<T extends more_pictures_clearanceCountArgs>(
      args?: Subset<T, more_pictures_clearanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], More_pictures_clearanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a More_pictures_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {More_pictures_clearanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends More_pictures_clearanceAggregateArgs>(args: Subset<T, More_pictures_clearanceAggregateArgs>): Prisma.PrismaPromise<GetMore_pictures_clearanceAggregateType<T>>

    /**
     * Group by More_pictures_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_clearanceGroupByArgs} args - Group by arguments.
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
      T extends more_pictures_clearanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: more_pictures_clearanceGroupByArgs['orderBy'] }
        : { orderBy?: more_pictures_clearanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, more_pictures_clearanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMore_pictures_clearanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the more_pictures_clearance model
   */
  readonly fields: more_pictures_clearanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for more_pictures_clearance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__more_pictures_clearanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the more_pictures_clearance model
   */
  interface more_pictures_clearanceFieldRefs {
    readonly mpc_id: FieldRef<"more_pictures_clearance", 'BigInt'>
    readonly product_id: FieldRef<"more_pictures_clearance", 'Int'>
    readonly product_picture: FieldRef<"more_pictures_clearance", 'String'>
    readonly create_date: FieldRef<"more_pictures_clearance", 'DateTime'>
    readonly create_name: FieldRef<"more_pictures_clearance", 'String'>
    readonly update_date: FieldRef<"more_pictures_clearance", 'DateTime'>
    readonly update_name: FieldRef<"more_pictures_clearance", 'String'>
  }
    

  // Custom InputTypes
  /**
   * more_pictures_clearance findUnique
   */
  export type more_pictures_clearanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_clearance to fetch.
     */
    where: more_pictures_clearanceWhereUniqueInput
  }

  /**
   * more_pictures_clearance findUniqueOrThrow
   */
  export type more_pictures_clearanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_clearance to fetch.
     */
    where: more_pictures_clearanceWhereUniqueInput
  }

  /**
   * more_pictures_clearance findFirst
   */
  export type more_pictures_clearanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_clearance to fetch.
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_clearances to fetch.
     */
    orderBy?: more_pictures_clearanceOrderByWithRelationInput | more_pictures_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures_clearances.
     */
    cursor?: more_pictures_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures_clearances.
     */
    distinct?: More_pictures_clearanceScalarFieldEnum | More_pictures_clearanceScalarFieldEnum[]
  }

  /**
   * more_pictures_clearance findFirstOrThrow
   */
  export type more_pictures_clearanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_clearance to fetch.
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_clearances to fetch.
     */
    orderBy?: more_pictures_clearanceOrderByWithRelationInput | more_pictures_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures_clearances.
     */
    cursor?: more_pictures_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures_clearances.
     */
    distinct?: More_pictures_clearanceScalarFieldEnum | More_pictures_clearanceScalarFieldEnum[]
  }

  /**
   * more_pictures_clearance findMany
   */
  export type more_pictures_clearanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_clearances to fetch.
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_clearances to fetch.
     */
    orderBy?: more_pictures_clearanceOrderByWithRelationInput | more_pictures_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing more_pictures_clearances.
     */
    cursor?: more_pictures_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_clearances.
     */
    skip?: number
    distinct?: More_pictures_clearanceScalarFieldEnum | More_pictures_clearanceScalarFieldEnum[]
  }

  /**
   * more_pictures_clearance create
   */
  export type more_pictures_clearanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to create a more_pictures_clearance.
     */
    data: XOR<more_pictures_clearanceCreateInput, more_pictures_clearanceUncheckedCreateInput>
  }

  /**
   * more_pictures_clearance createMany
   */
  export type more_pictures_clearanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many more_pictures_clearances.
     */
    data: more_pictures_clearanceCreateManyInput | more_pictures_clearanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * more_pictures_clearance update
   */
  export type more_pictures_clearanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to update a more_pictures_clearance.
     */
    data: XOR<more_pictures_clearanceUpdateInput, more_pictures_clearanceUncheckedUpdateInput>
    /**
     * Choose, which more_pictures_clearance to update.
     */
    where: more_pictures_clearanceWhereUniqueInput
  }

  /**
   * more_pictures_clearance updateMany
   */
  export type more_pictures_clearanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update more_pictures_clearances.
     */
    data: XOR<more_pictures_clearanceUpdateManyMutationInput, more_pictures_clearanceUncheckedUpdateManyInput>
    /**
     * Filter which more_pictures_clearances to update
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * Limit how many more_pictures_clearances to update.
     */
    limit?: number
  }

  /**
   * more_pictures_clearance upsert
   */
  export type more_pictures_clearanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * The filter to search for the more_pictures_clearance to update in case it exists.
     */
    where: more_pictures_clearanceWhereUniqueInput
    /**
     * In case the more_pictures_clearance found by the `where` argument doesn't exist, create a new more_pictures_clearance with this data.
     */
    create: XOR<more_pictures_clearanceCreateInput, more_pictures_clearanceUncheckedCreateInput>
    /**
     * In case the more_pictures_clearance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<more_pictures_clearanceUpdateInput, more_pictures_clearanceUncheckedUpdateInput>
  }

  /**
   * more_pictures_clearance delete
   */
  export type more_pictures_clearanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
    /**
     * Filter which more_pictures_clearance to delete.
     */
    where: more_pictures_clearanceWhereUniqueInput
  }

  /**
   * more_pictures_clearance deleteMany
   */
  export type more_pictures_clearanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures_clearances to delete
     */
    where?: more_pictures_clearanceWhereInput
    /**
     * Limit how many more_pictures_clearances to delete.
     */
    limit?: number
  }

  /**
   * more_pictures_clearance without action
   */
  export type more_pictures_clearanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_clearance
     */
    select?: more_pictures_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_clearance
     */
    omit?: more_pictures_clearanceOmit<ExtArgs> | null
  }


  /**
   * Model more_pictures_test
   */

  export type AggregateMore_pictures_test = {
    _count: More_pictures_testCountAggregateOutputType | null
    _avg: More_pictures_testAvgAggregateOutputType | null
    _sum: More_pictures_testSumAggregateOutputType | null
    _min: More_pictures_testMinAggregateOutputType | null
    _max: More_pictures_testMaxAggregateOutputType | null
  }

  export type More_pictures_testAvgAggregateOutputType = {
    mpt_id: number | null
    product_id: number | null
  }

  export type More_pictures_testSumAggregateOutputType = {
    mpt_id: bigint | null
    product_id: number | null
  }

  export type More_pictures_testMinAggregateOutputType = {
    mpt_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_pictures_testMaxAggregateOutputType = {
    mpt_id: bigint | null
    product_id: number | null
    product_picture: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type More_pictures_testCountAggregateOutputType = {
    mpt_id: number
    product_id: number
    product_picture: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type More_pictures_testAvgAggregateInputType = {
    mpt_id?: true
    product_id?: true
  }

  export type More_pictures_testSumAggregateInputType = {
    mpt_id?: true
    product_id?: true
  }

  export type More_pictures_testMinAggregateInputType = {
    mpt_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_pictures_testMaxAggregateInputType = {
    mpt_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type More_pictures_testCountAggregateInputType = {
    mpt_id?: true
    product_id?: true
    product_picture?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type More_pictures_testAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures_test to aggregate.
     */
    where?: more_pictures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_tests to fetch.
     */
    orderBy?: more_pictures_testOrderByWithRelationInput | more_pictures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: more_pictures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned more_pictures_tests
    **/
    _count?: true | More_pictures_testCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: More_pictures_testAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: More_pictures_testSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: More_pictures_testMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: More_pictures_testMaxAggregateInputType
  }

  export type GetMore_pictures_testAggregateType<T extends More_pictures_testAggregateArgs> = {
        [P in keyof T & keyof AggregateMore_pictures_test]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMore_pictures_test[P]>
      : GetScalarType<T[P], AggregateMore_pictures_test[P]>
  }




  export type more_pictures_testGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: more_pictures_testWhereInput
    orderBy?: more_pictures_testOrderByWithAggregationInput | more_pictures_testOrderByWithAggregationInput[]
    by: More_pictures_testScalarFieldEnum[] | More_pictures_testScalarFieldEnum
    having?: more_pictures_testScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: More_pictures_testCountAggregateInputType | true
    _avg?: More_pictures_testAvgAggregateInputType
    _sum?: More_pictures_testSumAggregateInputType
    _min?: More_pictures_testMinAggregateInputType
    _max?: More_pictures_testMaxAggregateInputType
  }

  export type More_pictures_testGroupByOutputType = {
    mpt_id: bigint
    product_id: number
    product_picture: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: More_pictures_testCountAggregateOutputType | null
    _avg: More_pictures_testAvgAggregateOutputType | null
    _sum: More_pictures_testSumAggregateOutputType | null
    _min: More_pictures_testMinAggregateOutputType | null
    _max: More_pictures_testMaxAggregateOutputType | null
  }

  type GetMore_pictures_testGroupByPayload<T extends more_pictures_testGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<More_pictures_testGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof More_pictures_testGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], More_pictures_testGroupByOutputType[P]>
            : GetScalarType<T[P], More_pictures_testGroupByOutputType[P]>
        }
      >
    >


  export type more_pictures_testSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mpt_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["more_pictures_test"]>



  export type more_pictures_testSelectScalar = {
    mpt_id?: boolean
    product_id?: boolean
    product_picture?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type more_pictures_testOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"mpt_id" | "product_id" | "product_picture" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["more_pictures_test"]>

  export type $more_pictures_testPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "more_pictures_test"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      mpt_id: bigint
      product_id: number
      product_picture: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["more_pictures_test"]>
    composites: {}
  }

  type more_pictures_testGetPayload<S extends boolean | null | undefined | more_pictures_testDefaultArgs> = $Result.GetResult<Prisma.$more_pictures_testPayload, S>

  type more_pictures_testCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<more_pictures_testFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: More_pictures_testCountAggregateInputType | true
    }

  export interface more_pictures_testDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['more_pictures_test'], meta: { name: 'more_pictures_test' } }
    /**
     * Find zero or one More_pictures_test that matches the filter.
     * @param {more_pictures_testFindUniqueArgs} args - Arguments to find a More_pictures_test
     * @example
     * // Get one More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends more_pictures_testFindUniqueArgs>(args: SelectSubset<T, more_pictures_testFindUniqueArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one More_pictures_test that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {more_pictures_testFindUniqueOrThrowArgs} args - Arguments to find a More_pictures_test
     * @example
     * // Get one More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends more_pictures_testFindUniqueOrThrowArgs>(args: SelectSubset<T, more_pictures_testFindUniqueOrThrowArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures_test that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testFindFirstArgs} args - Arguments to find a More_pictures_test
     * @example
     * // Get one More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends more_pictures_testFindFirstArgs>(args?: SelectSubset<T, more_pictures_testFindFirstArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first More_pictures_test that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testFindFirstOrThrowArgs} args - Arguments to find a More_pictures_test
     * @example
     * // Get one More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends more_pictures_testFindFirstOrThrowArgs>(args?: SelectSubset<T, more_pictures_testFindFirstOrThrowArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more More_pictures_tests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all More_pictures_tests
     * const more_pictures_tests = await prisma.more_pictures_test.findMany()
     * 
     * // Get first 10 More_pictures_tests
     * const more_pictures_tests = await prisma.more_pictures_test.findMany({ take: 10 })
     * 
     * // Only select the `mpt_id`
     * const more_pictures_testWithMpt_idOnly = await prisma.more_pictures_test.findMany({ select: { mpt_id: true } })
     * 
     */
    findMany<T extends more_pictures_testFindManyArgs>(args?: SelectSubset<T, more_pictures_testFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a More_pictures_test.
     * @param {more_pictures_testCreateArgs} args - Arguments to create a More_pictures_test.
     * @example
     * // Create one More_pictures_test
     * const More_pictures_test = await prisma.more_pictures_test.create({
     *   data: {
     *     // ... data to create a More_pictures_test
     *   }
     * })
     * 
     */
    create<T extends more_pictures_testCreateArgs>(args: SelectSubset<T, more_pictures_testCreateArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many More_pictures_tests.
     * @param {more_pictures_testCreateManyArgs} args - Arguments to create many More_pictures_tests.
     * @example
     * // Create many More_pictures_tests
     * const more_pictures_test = await prisma.more_pictures_test.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends more_pictures_testCreateManyArgs>(args?: SelectSubset<T, more_pictures_testCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a More_pictures_test.
     * @param {more_pictures_testDeleteArgs} args - Arguments to delete one More_pictures_test.
     * @example
     * // Delete one More_pictures_test
     * const More_pictures_test = await prisma.more_pictures_test.delete({
     *   where: {
     *     // ... filter to delete one More_pictures_test
     *   }
     * })
     * 
     */
    delete<T extends more_pictures_testDeleteArgs>(args: SelectSubset<T, more_pictures_testDeleteArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one More_pictures_test.
     * @param {more_pictures_testUpdateArgs} args - Arguments to update one More_pictures_test.
     * @example
     * // Update one More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends more_pictures_testUpdateArgs>(args: SelectSubset<T, more_pictures_testUpdateArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more More_pictures_tests.
     * @param {more_pictures_testDeleteManyArgs} args - Arguments to filter More_pictures_tests to delete.
     * @example
     * // Delete a few More_pictures_tests
     * const { count } = await prisma.more_pictures_test.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends more_pictures_testDeleteManyArgs>(args?: SelectSubset<T, more_pictures_testDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more More_pictures_tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many More_pictures_tests
     * const more_pictures_test = await prisma.more_pictures_test.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends more_pictures_testUpdateManyArgs>(args: SelectSubset<T, more_pictures_testUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one More_pictures_test.
     * @param {more_pictures_testUpsertArgs} args - Arguments to update or create a More_pictures_test.
     * @example
     * // Update or create a More_pictures_test
     * const more_pictures_test = await prisma.more_pictures_test.upsert({
     *   create: {
     *     // ... data to create a More_pictures_test
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the More_pictures_test we want to update
     *   }
     * })
     */
    upsert<T extends more_pictures_testUpsertArgs>(args: SelectSubset<T, more_pictures_testUpsertArgs<ExtArgs>>): Prisma__more_pictures_testClient<$Result.GetResult<Prisma.$more_pictures_testPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of More_pictures_tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testCountArgs} args - Arguments to filter More_pictures_tests to count.
     * @example
     * // Count the number of More_pictures_tests
     * const count = await prisma.more_pictures_test.count({
     *   where: {
     *     // ... the filter for the More_pictures_tests we want to count
     *   }
     * })
    **/
    count<T extends more_pictures_testCountArgs>(
      args?: Subset<T, more_pictures_testCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], More_pictures_testCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a More_pictures_test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {More_pictures_testAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends More_pictures_testAggregateArgs>(args: Subset<T, More_pictures_testAggregateArgs>): Prisma.PrismaPromise<GetMore_pictures_testAggregateType<T>>

    /**
     * Group by More_pictures_test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {more_pictures_testGroupByArgs} args - Group by arguments.
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
      T extends more_pictures_testGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: more_pictures_testGroupByArgs['orderBy'] }
        : { orderBy?: more_pictures_testGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, more_pictures_testGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMore_pictures_testGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the more_pictures_test model
   */
  readonly fields: more_pictures_testFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for more_pictures_test.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__more_pictures_testClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the more_pictures_test model
   */
  interface more_pictures_testFieldRefs {
    readonly mpt_id: FieldRef<"more_pictures_test", 'BigInt'>
    readonly product_id: FieldRef<"more_pictures_test", 'Int'>
    readonly product_picture: FieldRef<"more_pictures_test", 'String'>
    readonly create_date: FieldRef<"more_pictures_test", 'DateTime'>
    readonly create_name: FieldRef<"more_pictures_test", 'String'>
    readonly update_date: FieldRef<"more_pictures_test", 'DateTime'>
    readonly update_name: FieldRef<"more_pictures_test", 'String'>
  }
    

  // Custom InputTypes
  /**
   * more_pictures_test findUnique
   */
  export type more_pictures_testFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_test to fetch.
     */
    where: more_pictures_testWhereUniqueInput
  }

  /**
   * more_pictures_test findUniqueOrThrow
   */
  export type more_pictures_testFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_test to fetch.
     */
    where: more_pictures_testWhereUniqueInput
  }

  /**
   * more_pictures_test findFirst
   */
  export type more_pictures_testFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_test to fetch.
     */
    where?: more_pictures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_tests to fetch.
     */
    orderBy?: more_pictures_testOrderByWithRelationInput | more_pictures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures_tests.
     */
    cursor?: more_pictures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures_tests.
     */
    distinct?: More_pictures_testScalarFieldEnum | More_pictures_testScalarFieldEnum[]
  }

  /**
   * more_pictures_test findFirstOrThrow
   */
  export type more_pictures_testFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_test to fetch.
     */
    where?: more_pictures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_tests to fetch.
     */
    orderBy?: more_pictures_testOrderByWithRelationInput | more_pictures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for more_pictures_tests.
     */
    cursor?: more_pictures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of more_pictures_tests.
     */
    distinct?: More_pictures_testScalarFieldEnum | More_pictures_testScalarFieldEnum[]
  }

  /**
   * more_pictures_test findMany
   */
  export type more_pictures_testFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter, which more_pictures_tests to fetch.
     */
    where?: more_pictures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of more_pictures_tests to fetch.
     */
    orderBy?: more_pictures_testOrderByWithRelationInput | more_pictures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing more_pictures_tests.
     */
    cursor?: more_pictures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` more_pictures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` more_pictures_tests.
     */
    skip?: number
    distinct?: More_pictures_testScalarFieldEnum | More_pictures_testScalarFieldEnum[]
  }

  /**
   * more_pictures_test create
   */
  export type more_pictures_testCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * The data needed to create a more_pictures_test.
     */
    data: XOR<more_pictures_testCreateInput, more_pictures_testUncheckedCreateInput>
  }

  /**
   * more_pictures_test createMany
   */
  export type more_pictures_testCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many more_pictures_tests.
     */
    data: more_pictures_testCreateManyInput | more_pictures_testCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * more_pictures_test update
   */
  export type more_pictures_testUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * The data needed to update a more_pictures_test.
     */
    data: XOR<more_pictures_testUpdateInput, more_pictures_testUncheckedUpdateInput>
    /**
     * Choose, which more_pictures_test to update.
     */
    where: more_pictures_testWhereUniqueInput
  }

  /**
   * more_pictures_test updateMany
   */
  export type more_pictures_testUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update more_pictures_tests.
     */
    data: XOR<more_pictures_testUpdateManyMutationInput, more_pictures_testUncheckedUpdateManyInput>
    /**
     * Filter which more_pictures_tests to update
     */
    where?: more_pictures_testWhereInput
    /**
     * Limit how many more_pictures_tests to update.
     */
    limit?: number
  }

  /**
   * more_pictures_test upsert
   */
  export type more_pictures_testUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * The filter to search for the more_pictures_test to update in case it exists.
     */
    where: more_pictures_testWhereUniqueInput
    /**
     * In case the more_pictures_test found by the `where` argument doesn't exist, create a new more_pictures_test with this data.
     */
    create: XOR<more_pictures_testCreateInput, more_pictures_testUncheckedCreateInput>
    /**
     * In case the more_pictures_test was found with the provided `where` argument, update it with this data.
     */
    update: XOR<more_pictures_testUpdateInput, more_pictures_testUncheckedUpdateInput>
  }

  /**
   * more_pictures_test delete
   */
  export type more_pictures_testDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
    /**
     * Filter which more_pictures_test to delete.
     */
    where: more_pictures_testWhereUniqueInput
  }

  /**
   * more_pictures_test deleteMany
   */
  export type more_pictures_testDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which more_pictures_tests to delete
     */
    where?: more_pictures_testWhereInput
    /**
     * Limit how many more_pictures_tests to delete.
     */
    limit?: number
  }

  /**
   * more_pictures_test without action
   */
  export type more_pictures_testDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the more_pictures_test
     */
    select?: more_pictures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the more_pictures_test
     */
    omit?: more_pictures_testOmit<ExtArgs> | null
  }


  /**
   * Model part_clearance
   */

  export type AggregatePart_clearance = {
    _count: Part_clearanceCountAggregateOutputType | null
    _avg: Part_clearanceAvgAggregateOutputType | null
    _sum: Part_clearanceSumAggregateOutputType | null
    _min: Part_clearanceMinAggregateOutputType | null
    _max: Part_clearanceMaxAggregateOutputType | null
  }

  export type Part_clearanceAvgAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_status: number | null
    users_action: number | null
  }

  export type Part_clearanceSumAggregateOutputType = {
    part_id: number | null
    category_id: number | null
    sub_id: number | null
    part_status: number | null
    users_action: number | null
  }

  export type Part_clearanceMinAggregateOutputType = {
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

  export type Part_clearanceMaxAggregateOutputType = {
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

  export type Part_clearanceCountAggregateOutputType = {
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


  export type Part_clearanceAvgAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_status?: true
    users_action?: true
  }

  export type Part_clearanceSumAggregateInputType = {
    part_id?: true
    category_id?: true
    sub_id?: true
    part_status?: true
    users_action?: true
  }

  export type Part_clearanceMinAggregateInputType = {
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

  export type Part_clearanceMaxAggregateInputType = {
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

  export type Part_clearanceCountAggregateInputType = {
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

  export type Part_clearanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which part_clearance to aggregate.
     */
    where?: part_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of part_clearances to fetch.
     */
    orderBy?: part_clearanceOrderByWithRelationInput | part_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: part_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` part_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` part_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned part_clearances
    **/
    _count?: true | Part_clearanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Part_clearanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Part_clearanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Part_clearanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Part_clearanceMaxAggregateInputType
  }

  export type GetPart_clearanceAggregateType<T extends Part_clearanceAggregateArgs> = {
        [P in keyof T & keyof AggregatePart_clearance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePart_clearance[P]>
      : GetScalarType<T[P], AggregatePart_clearance[P]>
  }




  export type part_clearanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: part_clearanceWhereInput
    orderBy?: part_clearanceOrderByWithAggregationInput | part_clearanceOrderByWithAggregationInput[]
    by: Part_clearanceScalarFieldEnum[] | Part_clearanceScalarFieldEnum
    having?: part_clearanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Part_clearanceCountAggregateInputType | true
    _avg?: Part_clearanceAvgAggregateInputType
    _sum?: Part_clearanceSumAggregateInputType
    _min?: Part_clearanceMinAggregateInputType
    _max?: Part_clearanceMaxAggregateInputType
  }

  export type Part_clearanceGroupByOutputType = {
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
    _count: Part_clearanceCountAggregateOutputType | null
    _avg: Part_clearanceAvgAggregateOutputType | null
    _sum: Part_clearanceSumAggregateOutputType | null
    _min: Part_clearanceMinAggregateOutputType | null
    _max: Part_clearanceMaxAggregateOutputType | null
  }

  type GetPart_clearanceGroupByPayload<T extends part_clearanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Part_clearanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Part_clearanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Part_clearanceGroupByOutputType[P]>
            : GetScalarType<T[P], Part_clearanceGroupByOutputType[P]>
        }
      >
    >


  export type part_clearanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["part_clearance"]>



  export type part_clearanceSelectScalar = {
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

  export type part_clearanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"part_id" | "category_id" | "sub_id" | "part_name" | "part_picture" | "part_color" | "part_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["part_clearance"]>

  export type $part_clearancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "part_clearance"
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
    }, ExtArgs["result"]["part_clearance"]>
    composites: {}
  }

  type part_clearanceGetPayload<S extends boolean | null | undefined | part_clearanceDefaultArgs> = $Result.GetResult<Prisma.$part_clearancePayload, S>

  type part_clearanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<part_clearanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Part_clearanceCountAggregateInputType | true
    }

  export interface part_clearanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['part_clearance'], meta: { name: 'part_clearance' } }
    /**
     * Find zero or one Part_clearance that matches the filter.
     * @param {part_clearanceFindUniqueArgs} args - Arguments to find a Part_clearance
     * @example
     * // Get one Part_clearance
     * const part_clearance = await prisma.part_clearance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends part_clearanceFindUniqueArgs>(args: SelectSubset<T, part_clearanceFindUniqueArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Part_clearance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {part_clearanceFindUniqueOrThrowArgs} args - Arguments to find a Part_clearance
     * @example
     * // Get one Part_clearance
     * const part_clearance = await prisma.part_clearance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends part_clearanceFindUniqueOrThrowArgs>(args: SelectSubset<T, part_clearanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Part_clearance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceFindFirstArgs} args - Arguments to find a Part_clearance
     * @example
     * // Get one Part_clearance
     * const part_clearance = await prisma.part_clearance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends part_clearanceFindFirstArgs>(args?: SelectSubset<T, part_clearanceFindFirstArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Part_clearance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceFindFirstOrThrowArgs} args - Arguments to find a Part_clearance
     * @example
     * // Get one Part_clearance
     * const part_clearance = await prisma.part_clearance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends part_clearanceFindFirstOrThrowArgs>(args?: SelectSubset<T, part_clearanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Part_clearances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Part_clearances
     * const part_clearances = await prisma.part_clearance.findMany()
     * 
     * // Get first 10 Part_clearances
     * const part_clearances = await prisma.part_clearance.findMany({ take: 10 })
     * 
     * // Only select the `part_id`
     * const part_clearanceWithPart_idOnly = await prisma.part_clearance.findMany({ select: { part_id: true } })
     * 
     */
    findMany<T extends part_clearanceFindManyArgs>(args?: SelectSubset<T, part_clearanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Part_clearance.
     * @param {part_clearanceCreateArgs} args - Arguments to create a Part_clearance.
     * @example
     * // Create one Part_clearance
     * const Part_clearance = await prisma.part_clearance.create({
     *   data: {
     *     // ... data to create a Part_clearance
     *   }
     * })
     * 
     */
    create<T extends part_clearanceCreateArgs>(args: SelectSubset<T, part_clearanceCreateArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Part_clearances.
     * @param {part_clearanceCreateManyArgs} args - Arguments to create many Part_clearances.
     * @example
     * // Create many Part_clearances
     * const part_clearance = await prisma.part_clearance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends part_clearanceCreateManyArgs>(args?: SelectSubset<T, part_clearanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Part_clearance.
     * @param {part_clearanceDeleteArgs} args - Arguments to delete one Part_clearance.
     * @example
     * // Delete one Part_clearance
     * const Part_clearance = await prisma.part_clearance.delete({
     *   where: {
     *     // ... filter to delete one Part_clearance
     *   }
     * })
     * 
     */
    delete<T extends part_clearanceDeleteArgs>(args: SelectSubset<T, part_clearanceDeleteArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Part_clearance.
     * @param {part_clearanceUpdateArgs} args - Arguments to update one Part_clearance.
     * @example
     * // Update one Part_clearance
     * const part_clearance = await prisma.part_clearance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends part_clearanceUpdateArgs>(args: SelectSubset<T, part_clearanceUpdateArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Part_clearances.
     * @param {part_clearanceDeleteManyArgs} args - Arguments to filter Part_clearances to delete.
     * @example
     * // Delete a few Part_clearances
     * const { count } = await prisma.part_clearance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends part_clearanceDeleteManyArgs>(args?: SelectSubset<T, part_clearanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Part_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Part_clearances
     * const part_clearance = await prisma.part_clearance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends part_clearanceUpdateManyArgs>(args: SelectSubset<T, part_clearanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Part_clearance.
     * @param {part_clearanceUpsertArgs} args - Arguments to update or create a Part_clearance.
     * @example
     * // Update or create a Part_clearance
     * const part_clearance = await prisma.part_clearance.upsert({
     *   create: {
     *     // ... data to create a Part_clearance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Part_clearance we want to update
     *   }
     * })
     */
    upsert<T extends part_clearanceUpsertArgs>(args: SelectSubset<T, part_clearanceUpsertArgs<ExtArgs>>): Prisma__part_clearanceClient<$Result.GetResult<Prisma.$part_clearancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Part_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceCountArgs} args - Arguments to filter Part_clearances to count.
     * @example
     * // Count the number of Part_clearances
     * const count = await prisma.part_clearance.count({
     *   where: {
     *     // ... the filter for the Part_clearances we want to count
     *   }
     * })
    **/
    count<T extends part_clearanceCountArgs>(
      args?: Subset<T, part_clearanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Part_clearanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Part_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Part_clearanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Part_clearanceAggregateArgs>(args: Subset<T, Part_clearanceAggregateArgs>): Prisma.PrismaPromise<GetPart_clearanceAggregateType<T>>

    /**
     * Group by Part_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {part_clearanceGroupByArgs} args - Group by arguments.
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
      T extends part_clearanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: part_clearanceGroupByArgs['orderBy'] }
        : { orderBy?: part_clearanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, part_clearanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPart_clearanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the part_clearance model
   */
  readonly fields: part_clearanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for part_clearance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__part_clearanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the part_clearance model
   */
  interface part_clearanceFieldRefs {
    readonly part_id: FieldRef<"part_clearance", 'Int'>
    readonly category_id: FieldRef<"part_clearance", 'Int'>
    readonly sub_id: FieldRef<"part_clearance", 'Int'>
    readonly part_name: FieldRef<"part_clearance", 'String'>
    readonly part_picture: FieldRef<"part_clearance", 'String'>
    readonly part_color: FieldRef<"part_clearance", 'String'>
    readonly part_status: FieldRef<"part_clearance", 'Int'>
    readonly users_action: FieldRef<"part_clearance", 'Int'>
    readonly created_at: FieldRef<"part_clearance", 'DateTime'>
    readonly updated_at: FieldRef<"part_clearance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * part_clearance findUnique
   */
  export type part_clearanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which part_clearance to fetch.
     */
    where: part_clearanceWhereUniqueInput
  }

  /**
   * part_clearance findUniqueOrThrow
   */
  export type part_clearanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which part_clearance to fetch.
     */
    where: part_clearanceWhereUniqueInput
  }

  /**
   * part_clearance findFirst
   */
  export type part_clearanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which part_clearance to fetch.
     */
    where?: part_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of part_clearances to fetch.
     */
    orderBy?: part_clearanceOrderByWithRelationInput | part_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for part_clearances.
     */
    cursor?: part_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` part_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` part_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of part_clearances.
     */
    distinct?: Part_clearanceScalarFieldEnum | Part_clearanceScalarFieldEnum[]
  }

  /**
   * part_clearance findFirstOrThrow
   */
  export type part_clearanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which part_clearance to fetch.
     */
    where?: part_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of part_clearances to fetch.
     */
    orderBy?: part_clearanceOrderByWithRelationInput | part_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for part_clearances.
     */
    cursor?: part_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` part_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` part_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of part_clearances.
     */
    distinct?: Part_clearanceScalarFieldEnum | Part_clearanceScalarFieldEnum[]
  }

  /**
   * part_clearance findMany
   */
  export type part_clearanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which part_clearances to fetch.
     */
    where?: part_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of part_clearances to fetch.
     */
    orderBy?: part_clearanceOrderByWithRelationInput | part_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing part_clearances.
     */
    cursor?: part_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` part_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` part_clearances.
     */
    skip?: number
    distinct?: Part_clearanceScalarFieldEnum | Part_clearanceScalarFieldEnum[]
  }

  /**
   * part_clearance create
   */
  export type part_clearanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to create a part_clearance.
     */
    data: XOR<part_clearanceCreateInput, part_clearanceUncheckedCreateInput>
  }

  /**
   * part_clearance createMany
   */
  export type part_clearanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many part_clearances.
     */
    data: part_clearanceCreateManyInput | part_clearanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * part_clearance update
   */
  export type part_clearanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to update a part_clearance.
     */
    data: XOR<part_clearanceUpdateInput, part_clearanceUncheckedUpdateInput>
    /**
     * Choose, which part_clearance to update.
     */
    where: part_clearanceWhereUniqueInput
  }

  /**
   * part_clearance updateMany
   */
  export type part_clearanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update part_clearances.
     */
    data: XOR<part_clearanceUpdateManyMutationInput, part_clearanceUncheckedUpdateManyInput>
    /**
     * Filter which part_clearances to update
     */
    where?: part_clearanceWhereInput
    /**
     * Limit how many part_clearances to update.
     */
    limit?: number
  }

  /**
   * part_clearance upsert
   */
  export type part_clearanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * The filter to search for the part_clearance to update in case it exists.
     */
    where: part_clearanceWhereUniqueInput
    /**
     * In case the part_clearance found by the `where` argument doesn't exist, create a new part_clearance with this data.
     */
    create: XOR<part_clearanceCreateInput, part_clearanceUncheckedCreateInput>
    /**
     * In case the part_clearance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<part_clearanceUpdateInput, part_clearanceUncheckedUpdateInput>
  }

  /**
   * part_clearance delete
   */
  export type part_clearanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
    /**
     * Filter which part_clearance to delete.
     */
    where: part_clearanceWhereUniqueInput
  }

  /**
   * part_clearance deleteMany
   */
  export type part_clearanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which part_clearances to delete
     */
    where?: part_clearanceWhereInput
    /**
     * Limit how many part_clearances to delete.
     */
    limit?: number
  }

  /**
   * part_clearance without action
   */
  export type part_clearanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the part_clearance
     */
    select?: part_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the part_clearance
     */
    omit?: part_clearanceOmit<ExtArgs> | null
  }


  /**
   * Model producoptions_clearance_tb
   */

  export type AggregateProducoptions_clearance_tb = {
    _count: Producoptions_clearance_tbCountAggregateOutputType | null
    _avg: Producoptions_clearance_tbAvgAggregateOutputType | null
    _sum: Producoptions_clearance_tbSumAggregateOutputType | null
    _min: Producoptions_clearance_tbMinAggregateOutputType | null
    _max: Producoptions_clearance_tbMaxAggregateOutputType | null
  }

  export type Producoptions_clearance_tbAvgAggregateOutputType = {
    pot_id: number | null
    product_id: number | null
  }

  export type Producoptions_clearance_tbSumAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
  }

  export type Producoptions_clearance_tbMinAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
    product_option: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Producoptions_clearance_tbMaxAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
    product_option: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Producoptions_clearance_tbCountAggregateOutputType = {
    pot_id: number
    product_id: number
    product_option: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type Producoptions_clearance_tbAvgAggregateInputType = {
    pot_id?: true
    product_id?: true
  }

  export type Producoptions_clearance_tbSumAggregateInputType = {
    pot_id?: true
    product_id?: true
  }

  export type Producoptions_clearance_tbMinAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Producoptions_clearance_tbMaxAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Producoptions_clearance_tbCountAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type Producoptions_clearance_tbAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which producoptions_clearance_tb to aggregate.
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_clearance_tbs to fetch.
     */
    orderBy?: producoptions_clearance_tbOrderByWithRelationInput | producoptions_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: producoptions_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned producoptions_clearance_tbs
    **/
    _count?: true | Producoptions_clearance_tbCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Producoptions_clearance_tbAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Producoptions_clearance_tbSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Producoptions_clearance_tbMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Producoptions_clearance_tbMaxAggregateInputType
  }

  export type GetProducoptions_clearance_tbAggregateType<T extends Producoptions_clearance_tbAggregateArgs> = {
        [P in keyof T & keyof AggregateProducoptions_clearance_tb]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProducoptions_clearance_tb[P]>
      : GetScalarType<T[P], AggregateProducoptions_clearance_tb[P]>
  }




  export type producoptions_clearance_tbGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: producoptions_clearance_tbWhereInput
    orderBy?: producoptions_clearance_tbOrderByWithAggregationInput | producoptions_clearance_tbOrderByWithAggregationInput[]
    by: Producoptions_clearance_tbScalarFieldEnum[] | Producoptions_clearance_tbScalarFieldEnum
    having?: producoptions_clearance_tbScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Producoptions_clearance_tbCountAggregateInputType | true
    _avg?: Producoptions_clearance_tbAvgAggregateInputType
    _sum?: Producoptions_clearance_tbSumAggregateInputType
    _min?: Producoptions_clearance_tbMinAggregateInputType
    _max?: Producoptions_clearance_tbMaxAggregateInputType
  }

  export type Producoptions_clearance_tbGroupByOutputType = {
    pot_id: bigint
    product_id: number
    product_option: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: Producoptions_clearance_tbCountAggregateOutputType | null
    _avg: Producoptions_clearance_tbAvgAggregateOutputType | null
    _sum: Producoptions_clearance_tbSumAggregateOutputType | null
    _min: Producoptions_clearance_tbMinAggregateOutputType | null
    _max: Producoptions_clearance_tbMaxAggregateOutputType | null
  }

  type GetProducoptions_clearance_tbGroupByPayload<T extends producoptions_clearance_tbGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Producoptions_clearance_tbGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Producoptions_clearance_tbGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Producoptions_clearance_tbGroupByOutputType[P]>
            : GetScalarType<T[P], Producoptions_clearance_tbGroupByOutputType[P]>
        }
      >
    >


  export type producoptions_clearance_tbSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pot_id?: boolean
    product_id?: boolean
    product_option?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["producoptions_clearance_tb"]>



  export type producoptions_clearance_tbSelectScalar = {
    pot_id?: boolean
    product_id?: boolean
    product_option?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type producoptions_clearance_tbOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"pot_id" | "product_id" | "product_option" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["producoptions_clearance_tb"]>

  export type $producoptions_clearance_tbPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "producoptions_clearance_tb"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      pot_id: bigint
      product_id: number
      product_option: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["producoptions_clearance_tb"]>
    composites: {}
  }

  type producoptions_clearance_tbGetPayload<S extends boolean | null | undefined | producoptions_clearance_tbDefaultArgs> = $Result.GetResult<Prisma.$producoptions_clearance_tbPayload, S>

  type producoptions_clearance_tbCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<producoptions_clearance_tbFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Producoptions_clearance_tbCountAggregateInputType | true
    }

  export interface producoptions_clearance_tbDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['producoptions_clearance_tb'], meta: { name: 'producoptions_clearance_tb' } }
    /**
     * Find zero or one Producoptions_clearance_tb that matches the filter.
     * @param {producoptions_clearance_tbFindUniqueArgs} args - Arguments to find a Producoptions_clearance_tb
     * @example
     * // Get one Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends producoptions_clearance_tbFindUniqueArgs>(args: SelectSubset<T, producoptions_clearance_tbFindUniqueArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Producoptions_clearance_tb that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {producoptions_clearance_tbFindUniqueOrThrowArgs} args - Arguments to find a Producoptions_clearance_tb
     * @example
     * // Get one Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends producoptions_clearance_tbFindUniqueOrThrowArgs>(args: SelectSubset<T, producoptions_clearance_tbFindUniqueOrThrowArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Producoptions_clearance_tb that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbFindFirstArgs} args - Arguments to find a Producoptions_clearance_tb
     * @example
     * // Get one Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends producoptions_clearance_tbFindFirstArgs>(args?: SelectSubset<T, producoptions_clearance_tbFindFirstArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Producoptions_clearance_tb that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbFindFirstOrThrowArgs} args - Arguments to find a Producoptions_clearance_tb
     * @example
     * // Get one Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends producoptions_clearance_tbFindFirstOrThrowArgs>(args?: SelectSubset<T, producoptions_clearance_tbFindFirstOrThrowArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Producoptions_clearance_tbs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Producoptions_clearance_tbs
     * const producoptions_clearance_tbs = await prisma.producoptions_clearance_tb.findMany()
     * 
     * // Get first 10 Producoptions_clearance_tbs
     * const producoptions_clearance_tbs = await prisma.producoptions_clearance_tb.findMany({ take: 10 })
     * 
     * // Only select the `pot_id`
     * const producoptions_clearance_tbWithPot_idOnly = await prisma.producoptions_clearance_tb.findMany({ select: { pot_id: true } })
     * 
     */
    findMany<T extends producoptions_clearance_tbFindManyArgs>(args?: SelectSubset<T, producoptions_clearance_tbFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Producoptions_clearance_tb.
     * @param {producoptions_clearance_tbCreateArgs} args - Arguments to create a Producoptions_clearance_tb.
     * @example
     * // Create one Producoptions_clearance_tb
     * const Producoptions_clearance_tb = await prisma.producoptions_clearance_tb.create({
     *   data: {
     *     // ... data to create a Producoptions_clearance_tb
     *   }
     * })
     * 
     */
    create<T extends producoptions_clearance_tbCreateArgs>(args: SelectSubset<T, producoptions_clearance_tbCreateArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Producoptions_clearance_tbs.
     * @param {producoptions_clearance_tbCreateManyArgs} args - Arguments to create many Producoptions_clearance_tbs.
     * @example
     * // Create many Producoptions_clearance_tbs
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends producoptions_clearance_tbCreateManyArgs>(args?: SelectSubset<T, producoptions_clearance_tbCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Producoptions_clearance_tb.
     * @param {producoptions_clearance_tbDeleteArgs} args - Arguments to delete one Producoptions_clearance_tb.
     * @example
     * // Delete one Producoptions_clearance_tb
     * const Producoptions_clearance_tb = await prisma.producoptions_clearance_tb.delete({
     *   where: {
     *     // ... filter to delete one Producoptions_clearance_tb
     *   }
     * })
     * 
     */
    delete<T extends producoptions_clearance_tbDeleteArgs>(args: SelectSubset<T, producoptions_clearance_tbDeleteArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Producoptions_clearance_tb.
     * @param {producoptions_clearance_tbUpdateArgs} args - Arguments to update one Producoptions_clearance_tb.
     * @example
     * // Update one Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends producoptions_clearance_tbUpdateArgs>(args: SelectSubset<T, producoptions_clearance_tbUpdateArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Producoptions_clearance_tbs.
     * @param {producoptions_clearance_tbDeleteManyArgs} args - Arguments to filter Producoptions_clearance_tbs to delete.
     * @example
     * // Delete a few Producoptions_clearance_tbs
     * const { count } = await prisma.producoptions_clearance_tb.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends producoptions_clearance_tbDeleteManyArgs>(args?: SelectSubset<T, producoptions_clearance_tbDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Producoptions_clearance_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Producoptions_clearance_tbs
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends producoptions_clearance_tbUpdateManyArgs>(args: SelectSubset<T, producoptions_clearance_tbUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Producoptions_clearance_tb.
     * @param {producoptions_clearance_tbUpsertArgs} args - Arguments to update or create a Producoptions_clearance_tb.
     * @example
     * // Update or create a Producoptions_clearance_tb
     * const producoptions_clearance_tb = await prisma.producoptions_clearance_tb.upsert({
     *   create: {
     *     // ... data to create a Producoptions_clearance_tb
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Producoptions_clearance_tb we want to update
     *   }
     * })
     */
    upsert<T extends producoptions_clearance_tbUpsertArgs>(args: SelectSubset<T, producoptions_clearance_tbUpsertArgs<ExtArgs>>): Prisma__producoptions_clearance_tbClient<$Result.GetResult<Prisma.$producoptions_clearance_tbPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Producoptions_clearance_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbCountArgs} args - Arguments to filter Producoptions_clearance_tbs to count.
     * @example
     * // Count the number of Producoptions_clearance_tbs
     * const count = await prisma.producoptions_clearance_tb.count({
     *   where: {
     *     // ... the filter for the Producoptions_clearance_tbs we want to count
     *   }
     * })
    **/
    count<T extends producoptions_clearance_tbCountArgs>(
      args?: Subset<T, producoptions_clearance_tbCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Producoptions_clearance_tbCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Producoptions_clearance_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Producoptions_clearance_tbAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Producoptions_clearance_tbAggregateArgs>(args: Subset<T, Producoptions_clearance_tbAggregateArgs>): Prisma.PrismaPromise<GetProducoptions_clearance_tbAggregateType<T>>

    /**
     * Group by Producoptions_clearance_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_clearance_tbGroupByArgs} args - Group by arguments.
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
      T extends producoptions_clearance_tbGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: producoptions_clearance_tbGroupByArgs['orderBy'] }
        : { orderBy?: producoptions_clearance_tbGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, producoptions_clearance_tbGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProducoptions_clearance_tbGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the producoptions_clearance_tb model
   */
  readonly fields: producoptions_clearance_tbFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for producoptions_clearance_tb.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__producoptions_clearance_tbClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the producoptions_clearance_tb model
   */
  interface producoptions_clearance_tbFieldRefs {
    readonly pot_id: FieldRef<"producoptions_clearance_tb", 'BigInt'>
    readonly product_id: FieldRef<"producoptions_clearance_tb", 'Int'>
    readonly product_option: FieldRef<"producoptions_clearance_tb", 'String'>
    readonly create_date: FieldRef<"producoptions_clearance_tb", 'DateTime'>
    readonly create_name: FieldRef<"producoptions_clearance_tb", 'String'>
    readonly update_date: FieldRef<"producoptions_clearance_tb", 'DateTime'>
    readonly update_name: FieldRef<"producoptions_clearance_tb", 'String'>
  }
    

  // Custom InputTypes
  /**
   * producoptions_clearance_tb findUnique
   */
  export type producoptions_clearance_tbFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_clearance_tb to fetch.
     */
    where: producoptions_clearance_tbWhereUniqueInput
  }

  /**
   * producoptions_clearance_tb findUniqueOrThrow
   */
  export type producoptions_clearance_tbFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_clearance_tb to fetch.
     */
    where: producoptions_clearance_tbWhereUniqueInput
  }

  /**
   * producoptions_clearance_tb findFirst
   */
  export type producoptions_clearance_tbFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_clearance_tb to fetch.
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_clearance_tbs to fetch.
     */
    orderBy?: producoptions_clearance_tbOrderByWithRelationInput | producoptions_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for producoptions_clearance_tbs.
     */
    cursor?: producoptions_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of producoptions_clearance_tbs.
     */
    distinct?: Producoptions_clearance_tbScalarFieldEnum | Producoptions_clearance_tbScalarFieldEnum[]
  }

  /**
   * producoptions_clearance_tb findFirstOrThrow
   */
  export type producoptions_clearance_tbFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_clearance_tb to fetch.
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_clearance_tbs to fetch.
     */
    orderBy?: producoptions_clearance_tbOrderByWithRelationInput | producoptions_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for producoptions_clearance_tbs.
     */
    cursor?: producoptions_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_clearance_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of producoptions_clearance_tbs.
     */
    distinct?: Producoptions_clearance_tbScalarFieldEnum | Producoptions_clearance_tbScalarFieldEnum[]
  }

  /**
   * producoptions_clearance_tb findMany
   */
  export type producoptions_clearance_tbFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_clearance_tbs to fetch.
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_clearance_tbs to fetch.
     */
    orderBy?: producoptions_clearance_tbOrderByWithRelationInput | producoptions_clearance_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing producoptions_clearance_tbs.
     */
    cursor?: producoptions_clearance_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_clearance_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_clearance_tbs.
     */
    skip?: number
    distinct?: Producoptions_clearance_tbScalarFieldEnum | Producoptions_clearance_tbScalarFieldEnum[]
  }

  /**
   * producoptions_clearance_tb create
   */
  export type producoptions_clearance_tbCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * The data needed to create a producoptions_clearance_tb.
     */
    data: XOR<producoptions_clearance_tbCreateInput, producoptions_clearance_tbUncheckedCreateInput>
  }

  /**
   * producoptions_clearance_tb createMany
   */
  export type producoptions_clearance_tbCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many producoptions_clearance_tbs.
     */
    data: producoptions_clearance_tbCreateManyInput | producoptions_clearance_tbCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * producoptions_clearance_tb update
   */
  export type producoptions_clearance_tbUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * The data needed to update a producoptions_clearance_tb.
     */
    data: XOR<producoptions_clearance_tbUpdateInput, producoptions_clearance_tbUncheckedUpdateInput>
    /**
     * Choose, which producoptions_clearance_tb to update.
     */
    where: producoptions_clearance_tbWhereUniqueInput
  }

  /**
   * producoptions_clearance_tb updateMany
   */
  export type producoptions_clearance_tbUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update producoptions_clearance_tbs.
     */
    data: XOR<producoptions_clearance_tbUpdateManyMutationInput, producoptions_clearance_tbUncheckedUpdateManyInput>
    /**
     * Filter which producoptions_clearance_tbs to update
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * Limit how many producoptions_clearance_tbs to update.
     */
    limit?: number
  }

  /**
   * producoptions_clearance_tb upsert
   */
  export type producoptions_clearance_tbUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * The filter to search for the producoptions_clearance_tb to update in case it exists.
     */
    where: producoptions_clearance_tbWhereUniqueInput
    /**
     * In case the producoptions_clearance_tb found by the `where` argument doesn't exist, create a new producoptions_clearance_tb with this data.
     */
    create: XOR<producoptions_clearance_tbCreateInput, producoptions_clearance_tbUncheckedCreateInput>
    /**
     * In case the producoptions_clearance_tb was found with the provided `where` argument, update it with this data.
     */
    update: XOR<producoptions_clearance_tbUpdateInput, producoptions_clearance_tbUncheckedUpdateInput>
  }

  /**
   * producoptions_clearance_tb delete
   */
  export type producoptions_clearance_tbDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
    /**
     * Filter which producoptions_clearance_tb to delete.
     */
    where: producoptions_clearance_tbWhereUniqueInput
  }

  /**
   * producoptions_clearance_tb deleteMany
   */
  export type producoptions_clearance_tbDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which producoptions_clearance_tbs to delete
     */
    where?: producoptions_clearance_tbWhereInput
    /**
     * Limit how many producoptions_clearance_tbs to delete.
     */
    limit?: number
  }

  /**
   * producoptions_clearance_tb without action
   */
  export type producoptions_clearance_tbDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_clearance_tb
     */
    select?: producoptions_clearance_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_clearance_tb
     */
    omit?: producoptions_clearance_tbOmit<ExtArgs> | null
  }


  /**
   * Model producoptions_tb
   */

  export type AggregateProducoptions_tb = {
    _count: Producoptions_tbCountAggregateOutputType | null
    _avg: Producoptions_tbAvgAggregateOutputType | null
    _sum: Producoptions_tbSumAggregateOutputType | null
    _min: Producoptions_tbMinAggregateOutputType | null
    _max: Producoptions_tbMaxAggregateOutputType | null
  }

  export type Producoptions_tbAvgAggregateOutputType = {
    pot_id: number | null
    product_id: number | null
  }

  export type Producoptions_tbSumAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
  }

  export type Producoptions_tbMinAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
    product_option: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Producoptions_tbMaxAggregateOutputType = {
    pot_id: bigint | null
    product_id: number | null
    product_option: string | null
    create_date: Date | null
    create_name: string | null
    update_date: Date | null
    update_name: string | null
  }

  export type Producoptions_tbCountAggregateOutputType = {
    pot_id: number
    product_id: number
    product_option: number
    create_date: number
    create_name: number
    update_date: number
    update_name: number
    _all: number
  }


  export type Producoptions_tbAvgAggregateInputType = {
    pot_id?: true
    product_id?: true
  }

  export type Producoptions_tbSumAggregateInputType = {
    pot_id?: true
    product_id?: true
  }

  export type Producoptions_tbMinAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Producoptions_tbMaxAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
  }

  export type Producoptions_tbCountAggregateInputType = {
    pot_id?: true
    product_id?: true
    product_option?: true
    create_date?: true
    create_name?: true
    update_date?: true
    update_name?: true
    _all?: true
  }

  export type Producoptions_tbAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which producoptions_tb to aggregate.
     */
    where?: producoptions_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_tbs to fetch.
     */
    orderBy?: producoptions_tbOrderByWithRelationInput | producoptions_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: producoptions_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned producoptions_tbs
    **/
    _count?: true | Producoptions_tbCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Producoptions_tbAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Producoptions_tbSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Producoptions_tbMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Producoptions_tbMaxAggregateInputType
  }

  export type GetProducoptions_tbAggregateType<T extends Producoptions_tbAggregateArgs> = {
        [P in keyof T & keyof AggregateProducoptions_tb]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProducoptions_tb[P]>
      : GetScalarType<T[P], AggregateProducoptions_tb[P]>
  }




  export type producoptions_tbGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: producoptions_tbWhereInput
    orderBy?: producoptions_tbOrderByWithAggregationInput | producoptions_tbOrderByWithAggregationInput[]
    by: Producoptions_tbScalarFieldEnum[] | Producoptions_tbScalarFieldEnum
    having?: producoptions_tbScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Producoptions_tbCountAggregateInputType | true
    _avg?: Producoptions_tbAvgAggregateInputType
    _sum?: Producoptions_tbSumAggregateInputType
    _min?: Producoptions_tbMinAggregateInputType
    _max?: Producoptions_tbMaxAggregateInputType
  }

  export type Producoptions_tbGroupByOutputType = {
    pot_id: bigint
    product_id: number
    product_option: string
    create_date: Date
    create_name: string
    update_date: Date
    update_name: string
    _count: Producoptions_tbCountAggregateOutputType | null
    _avg: Producoptions_tbAvgAggregateOutputType | null
    _sum: Producoptions_tbSumAggregateOutputType | null
    _min: Producoptions_tbMinAggregateOutputType | null
    _max: Producoptions_tbMaxAggregateOutputType | null
  }

  type GetProducoptions_tbGroupByPayload<T extends producoptions_tbGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Producoptions_tbGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Producoptions_tbGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Producoptions_tbGroupByOutputType[P]>
            : GetScalarType<T[P], Producoptions_tbGroupByOutputType[P]>
        }
      >
    >


  export type producoptions_tbSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    pot_id?: boolean
    product_id?: boolean
    product_option?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }, ExtArgs["result"]["producoptions_tb"]>



  export type producoptions_tbSelectScalar = {
    pot_id?: boolean
    product_id?: boolean
    product_option?: boolean
    create_date?: boolean
    create_name?: boolean
    update_date?: boolean
    update_name?: boolean
  }

  export type producoptions_tbOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"pot_id" | "product_id" | "product_option" | "create_date" | "create_name" | "update_date" | "update_name", ExtArgs["result"]["producoptions_tb"]>

  export type $producoptions_tbPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "producoptions_tb"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      pot_id: bigint
      product_id: number
      product_option: string
      create_date: Date
      create_name: string
      update_date: Date
      update_name: string
    }, ExtArgs["result"]["producoptions_tb"]>
    composites: {}
  }

  type producoptions_tbGetPayload<S extends boolean | null | undefined | producoptions_tbDefaultArgs> = $Result.GetResult<Prisma.$producoptions_tbPayload, S>

  type producoptions_tbCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<producoptions_tbFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Producoptions_tbCountAggregateInputType | true
    }

  export interface producoptions_tbDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['producoptions_tb'], meta: { name: 'producoptions_tb' } }
    /**
     * Find zero or one Producoptions_tb that matches the filter.
     * @param {producoptions_tbFindUniqueArgs} args - Arguments to find a Producoptions_tb
     * @example
     * // Get one Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends producoptions_tbFindUniqueArgs>(args: SelectSubset<T, producoptions_tbFindUniqueArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Producoptions_tb that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {producoptions_tbFindUniqueOrThrowArgs} args - Arguments to find a Producoptions_tb
     * @example
     * // Get one Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends producoptions_tbFindUniqueOrThrowArgs>(args: SelectSubset<T, producoptions_tbFindUniqueOrThrowArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Producoptions_tb that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbFindFirstArgs} args - Arguments to find a Producoptions_tb
     * @example
     * // Get one Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends producoptions_tbFindFirstArgs>(args?: SelectSubset<T, producoptions_tbFindFirstArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Producoptions_tb that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbFindFirstOrThrowArgs} args - Arguments to find a Producoptions_tb
     * @example
     * // Get one Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends producoptions_tbFindFirstOrThrowArgs>(args?: SelectSubset<T, producoptions_tbFindFirstOrThrowArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Producoptions_tbs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Producoptions_tbs
     * const producoptions_tbs = await prisma.producoptions_tb.findMany()
     * 
     * // Get first 10 Producoptions_tbs
     * const producoptions_tbs = await prisma.producoptions_tb.findMany({ take: 10 })
     * 
     * // Only select the `pot_id`
     * const producoptions_tbWithPot_idOnly = await prisma.producoptions_tb.findMany({ select: { pot_id: true } })
     * 
     */
    findMany<T extends producoptions_tbFindManyArgs>(args?: SelectSubset<T, producoptions_tbFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Producoptions_tb.
     * @param {producoptions_tbCreateArgs} args - Arguments to create a Producoptions_tb.
     * @example
     * // Create one Producoptions_tb
     * const Producoptions_tb = await prisma.producoptions_tb.create({
     *   data: {
     *     // ... data to create a Producoptions_tb
     *   }
     * })
     * 
     */
    create<T extends producoptions_tbCreateArgs>(args: SelectSubset<T, producoptions_tbCreateArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Producoptions_tbs.
     * @param {producoptions_tbCreateManyArgs} args - Arguments to create many Producoptions_tbs.
     * @example
     * // Create many Producoptions_tbs
     * const producoptions_tb = await prisma.producoptions_tb.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends producoptions_tbCreateManyArgs>(args?: SelectSubset<T, producoptions_tbCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Producoptions_tb.
     * @param {producoptions_tbDeleteArgs} args - Arguments to delete one Producoptions_tb.
     * @example
     * // Delete one Producoptions_tb
     * const Producoptions_tb = await prisma.producoptions_tb.delete({
     *   where: {
     *     // ... filter to delete one Producoptions_tb
     *   }
     * })
     * 
     */
    delete<T extends producoptions_tbDeleteArgs>(args: SelectSubset<T, producoptions_tbDeleteArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Producoptions_tb.
     * @param {producoptions_tbUpdateArgs} args - Arguments to update one Producoptions_tb.
     * @example
     * // Update one Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends producoptions_tbUpdateArgs>(args: SelectSubset<T, producoptions_tbUpdateArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Producoptions_tbs.
     * @param {producoptions_tbDeleteManyArgs} args - Arguments to filter Producoptions_tbs to delete.
     * @example
     * // Delete a few Producoptions_tbs
     * const { count } = await prisma.producoptions_tb.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends producoptions_tbDeleteManyArgs>(args?: SelectSubset<T, producoptions_tbDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Producoptions_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Producoptions_tbs
     * const producoptions_tb = await prisma.producoptions_tb.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends producoptions_tbUpdateManyArgs>(args: SelectSubset<T, producoptions_tbUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Producoptions_tb.
     * @param {producoptions_tbUpsertArgs} args - Arguments to update or create a Producoptions_tb.
     * @example
     * // Update or create a Producoptions_tb
     * const producoptions_tb = await prisma.producoptions_tb.upsert({
     *   create: {
     *     // ... data to create a Producoptions_tb
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Producoptions_tb we want to update
     *   }
     * })
     */
    upsert<T extends producoptions_tbUpsertArgs>(args: SelectSubset<T, producoptions_tbUpsertArgs<ExtArgs>>): Prisma__producoptions_tbClient<$Result.GetResult<Prisma.$producoptions_tbPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Producoptions_tbs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbCountArgs} args - Arguments to filter Producoptions_tbs to count.
     * @example
     * // Count the number of Producoptions_tbs
     * const count = await prisma.producoptions_tb.count({
     *   where: {
     *     // ... the filter for the Producoptions_tbs we want to count
     *   }
     * })
    **/
    count<T extends producoptions_tbCountArgs>(
      args?: Subset<T, producoptions_tbCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Producoptions_tbCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Producoptions_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Producoptions_tbAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Producoptions_tbAggregateArgs>(args: Subset<T, Producoptions_tbAggregateArgs>): Prisma.PrismaPromise<GetProducoptions_tbAggregateType<T>>

    /**
     * Group by Producoptions_tb.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {producoptions_tbGroupByArgs} args - Group by arguments.
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
      T extends producoptions_tbGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: producoptions_tbGroupByArgs['orderBy'] }
        : { orderBy?: producoptions_tbGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, producoptions_tbGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProducoptions_tbGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the producoptions_tb model
   */
  readonly fields: producoptions_tbFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for producoptions_tb.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__producoptions_tbClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the producoptions_tb model
   */
  interface producoptions_tbFieldRefs {
    readonly pot_id: FieldRef<"producoptions_tb", 'BigInt'>
    readonly product_id: FieldRef<"producoptions_tb", 'Int'>
    readonly product_option: FieldRef<"producoptions_tb", 'String'>
    readonly create_date: FieldRef<"producoptions_tb", 'DateTime'>
    readonly create_name: FieldRef<"producoptions_tb", 'String'>
    readonly update_date: FieldRef<"producoptions_tb", 'DateTime'>
    readonly update_name: FieldRef<"producoptions_tb", 'String'>
  }
    

  // Custom InputTypes
  /**
   * producoptions_tb findUnique
   */
  export type producoptions_tbFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_tb to fetch.
     */
    where: producoptions_tbWhereUniqueInput
  }

  /**
   * producoptions_tb findUniqueOrThrow
   */
  export type producoptions_tbFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_tb to fetch.
     */
    where: producoptions_tbWhereUniqueInput
  }

  /**
   * producoptions_tb findFirst
   */
  export type producoptions_tbFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_tb to fetch.
     */
    where?: producoptions_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_tbs to fetch.
     */
    orderBy?: producoptions_tbOrderByWithRelationInput | producoptions_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for producoptions_tbs.
     */
    cursor?: producoptions_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of producoptions_tbs.
     */
    distinct?: Producoptions_tbScalarFieldEnum | Producoptions_tbScalarFieldEnum[]
  }

  /**
   * producoptions_tb findFirstOrThrow
   */
  export type producoptions_tbFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_tb to fetch.
     */
    where?: producoptions_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_tbs to fetch.
     */
    orderBy?: producoptions_tbOrderByWithRelationInput | producoptions_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for producoptions_tbs.
     */
    cursor?: producoptions_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_tbs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of producoptions_tbs.
     */
    distinct?: Producoptions_tbScalarFieldEnum | Producoptions_tbScalarFieldEnum[]
  }

  /**
   * producoptions_tb findMany
   */
  export type producoptions_tbFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter, which producoptions_tbs to fetch.
     */
    where?: producoptions_tbWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of producoptions_tbs to fetch.
     */
    orderBy?: producoptions_tbOrderByWithRelationInput | producoptions_tbOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing producoptions_tbs.
     */
    cursor?: producoptions_tbWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` producoptions_tbs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` producoptions_tbs.
     */
    skip?: number
    distinct?: Producoptions_tbScalarFieldEnum | Producoptions_tbScalarFieldEnum[]
  }

  /**
   * producoptions_tb create
   */
  export type producoptions_tbCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * The data needed to create a producoptions_tb.
     */
    data: XOR<producoptions_tbCreateInput, producoptions_tbUncheckedCreateInput>
  }

  /**
   * producoptions_tb createMany
   */
  export type producoptions_tbCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many producoptions_tbs.
     */
    data: producoptions_tbCreateManyInput | producoptions_tbCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * producoptions_tb update
   */
  export type producoptions_tbUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * The data needed to update a producoptions_tb.
     */
    data: XOR<producoptions_tbUpdateInput, producoptions_tbUncheckedUpdateInput>
    /**
     * Choose, which producoptions_tb to update.
     */
    where: producoptions_tbWhereUniqueInput
  }

  /**
   * producoptions_tb updateMany
   */
  export type producoptions_tbUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update producoptions_tbs.
     */
    data: XOR<producoptions_tbUpdateManyMutationInput, producoptions_tbUncheckedUpdateManyInput>
    /**
     * Filter which producoptions_tbs to update
     */
    where?: producoptions_tbWhereInput
    /**
     * Limit how many producoptions_tbs to update.
     */
    limit?: number
  }

  /**
   * producoptions_tb upsert
   */
  export type producoptions_tbUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * The filter to search for the producoptions_tb to update in case it exists.
     */
    where: producoptions_tbWhereUniqueInput
    /**
     * In case the producoptions_tb found by the `where` argument doesn't exist, create a new producoptions_tb with this data.
     */
    create: XOR<producoptions_tbCreateInput, producoptions_tbUncheckedCreateInput>
    /**
     * In case the producoptions_tb was found with the provided `where` argument, update it with this data.
     */
    update: XOR<producoptions_tbUpdateInput, producoptions_tbUncheckedUpdateInput>
  }

  /**
   * producoptions_tb delete
   */
  export type producoptions_tbDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
    /**
     * Filter which producoptions_tb to delete.
     */
    where: producoptions_tbWhereUniqueInput
  }

  /**
   * producoptions_tb deleteMany
   */
  export type producoptions_tbDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which producoptions_tbs to delete
     */
    where?: producoptions_tbWhereInput
    /**
     * Limit how many producoptions_tbs to delete.
     */
    limit?: number
  }

  /**
   * producoptions_tb without action
   */
  export type producoptions_tbDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the producoptions_tb
     */
    select?: producoptions_tbSelect<ExtArgs> | null
    /**
     * Omit specific fields from the producoptions_tb
     */
    omit?: producoptions_tbOmit<ExtArgs> | null
  }


  /**
   * Model product_clearance
   */

  export type AggregateProduct_clearance = {
    _count: Product_clearanceCountAggregateOutputType | null
    _avg: Product_clearanceAvgAggregateOutputType | null
    _sum: Product_clearanceSumAggregateOutputType | null
    _min: Product_clearanceMinAggregateOutputType | null
    _max: Product_clearanceMaxAggregateOutputType | null
  }

  export type Product_clearanceAvgAggregateOutputType = {
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

  export type Product_clearanceSumAggregateOutputType = {
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

  export type Product_clearanceMinAggregateOutputType = {
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

  export type Product_clearanceMaxAggregateOutputType = {
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

  export type Product_clearanceCountAggregateOutputType = {
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


  export type Product_clearanceAvgAggregateInputType = {
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

  export type Product_clearanceSumAggregateInputType = {
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

  export type Product_clearanceMinAggregateInputType = {
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

  export type Product_clearanceMaxAggregateInputType = {
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

  export type Product_clearanceCountAggregateInputType = {
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

  export type Product_clearanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_clearance to aggregate.
     */
    where?: product_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_clearances to fetch.
     */
    orderBy?: product_clearanceOrderByWithRelationInput | product_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: product_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned product_clearances
    **/
    _count?: true | Product_clearanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Product_clearanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Product_clearanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Product_clearanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Product_clearanceMaxAggregateInputType
  }

  export type GetProduct_clearanceAggregateType<T extends Product_clearanceAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct_clearance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct_clearance[P]>
      : GetScalarType<T[P], AggregateProduct_clearance[P]>
  }




  export type product_clearanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: product_clearanceWhereInput
    orderBy?: product_clearanceOrderByWithAggregationInput | product_clearanceOrderByWithAggregationInput[]
    by: Product_clearanceScalarFieldEnum[] | Product_clearanceScalarFieldEnum
    having?: product_clearanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Product_clearanceCountAggregateInputType | true
    _avg?: Product_clearanceAvgAggregateInputType
    _sum?: Product_clearanceSumAggregateInputType
    _min?: Product_clearanceMinAggregateInputType
    _max?: Product_clearanceMaxAggregateInputType
  }

  export type Product_clearanceGroupByOutputType = {
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
    _count: Product_clearanceCountAggregateOutputType | null
    _avg: Product_clearanceAvgAggregateOutputType | null
    _sum: Product_clearanceSumAggregateOutputType | null
    _min: Product_clearanceMinAggregateOutputType | null
    _max: Product_clearanceMaxAggregateOutputType | null
  }

  type GetProduct_clearanceGroupByPayload<T extends product_clearanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Product_clearanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Product_clearanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Product_clearanceGroupByOutputType[P]>
            : GetScalarType<T[P], Product_clearanceGroupByOutputType[P]>
        }
      >
    >


  export type product_clearanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["product_clearance"]>



  export type product_clearanceSelectScalar = {
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

  export type product_clearanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"product_id" | "category_id" | "sub_id" | "part_id" | "product_name" | "product_brand" | "product_description" | "product_picture" | "product_sku" | "product_file" | "product_filename" | "product_price" | "product_new" | "product_best" | "product_status" | "users_action" | "created_at" | "updated_at" | "product_uom" | "clearanceSales" | "clearanceQuantity" | "clearancePrice" | "expo_status" | "expo_price" | "cat5e" | "cat6" | "tool_tester", ExtArgs["result"]["product_clearance"]>

  export type $product_clearancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "product_clearance"
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
       */
      clearanceSales: boolean | null
      clearanceQuantity: number | null
      clearancePrice: Prisma.Decimal | null
      expo_status: number | null
      expo_price: Prisma.Decimal | null
      cat5e: number | null
      cat6: number | null
      tool_tester: number | null
    }, ExtArgs["result"]["product_clearance"]>
    composites: {}
  }

  type product_clearanceGetPayload<S extends boolean | null | undefined | product_clearanceDefaultArgs> = $Result.GetResult<Prisma.$product_clearancePayload, S>

  type product_clearanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<product_clearanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Product_clearanceCountAggregateInputType | true
    }

  export interface product_clearanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['product_clearance'], meta: { name: 'product_clearance' } }
    /**
     * Find zero or one Product_clearance that matches the filter.
     * @param {product_clearanceFindUniqueArgs} args - Arguments to find a Product_clearance
     * @example
     * // Get one Product_clearance
     * const product_clearance = await prisma.product_clearance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends product_clearanceFindUniqueArgs>(args: SelectSubset<T, product_clearanceFindUniqueArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product_clearance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {product_clearanceFindUniqueOrThrowArgs} args - Arguments to find a Product_clearance
     * @example
     * // Get one Product_clearance
     * const product_clearance = await prisma.product_clearance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends product_clearanceFindUniqueOrThrowArgs>(args: SelectSubset<T, product_clearanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_clearance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceFindFirstArgs} args - Arguments to find a Product_clearance
     * @example
     * // Get one Product_clearance
     * const product_clearance = await prisma.product_clearance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends product_clearanceFindFirstArgs>(args?: SelectSubset<T, product_clearanceFindFirstArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_clearance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceFindFirstOrThrowArgs} args - Arguments to find a Product_clearance
     * @example
     * // Get one Product_clearance
     * const product_clearance = await prisma.product_clearance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends product_clearanceFindFirstOrThrowArgs>(args?: SelectSubset<T, product_clearanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Product_clearances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Product_clearances
     * const product_clearances = await prisma.product_clearance.findMany()
     * 
     * // Get first 10 Product_clearances
     * const product_clearances = await prisma.product_clearance.findMany({ take: 10 })
     * 
     * // Only select the `product_id`
     * const product_clearanceWithProduct_idOnly = await prisma.product_clearance.findMany({ select: { product_id: true } })
     * 
     */
    findMany<T extends product_clearanceFindManyArgs>(args?: SelectSubset<T, product_clearanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product_clearance.
     * @param {product_clearanceCreateArgs} args - Arguments to create a Product_clearance.
     * @example
     * // Create one Product_clearance
     * const Product_clearance = await prisma.product_clearance.create({
     *   data: {
     *     // ... data to create a Product_clearance
     *   }
     * })
     * 
     */
    create<T extends product_clearanceCreateArgs>(args: SelectSubset<T, product_clearanceCreateArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Product_clearances.
     * @param {product_clearanceCreateManyArgs} args - Arguments to create many Product_clearances.
     * @example
     * // Create many Product_clearances
     * const product_clearance = await prisma.product_clearance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends product_clearanceCreateManyArgs>(args?: SelectSubset<T, product_clearanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Product_clearance.
     * @param {product_clearanceDeleteArgs} args - Arguments to delete one Product_clearance.
     * @example
     * // Delete one Product_clearance
     * const Product_clearance = await prisma.product_clearance.delete({
     *   where: {
     *     // ... filter to delete one Product_clearance
     *   }
     * })
     * 
     */
    delete<T extends product_clearanceDeleteArgs>(args: SelectSubset<T, product_clearanceDeleteArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product_clearance.
     * @param {product_clearanceUpdateArgs} args - Arguments to update one Product_clearance.
     * @example
     * // Update one Product_clearance
     * const product_clearance = await prisma.product_clearance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends product_clearanceUpdateArgs>(args: SelectSubset<T, product_clearanceUpdateArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Product_clearances.
     * @param {product_clearanceDeleteManyArgs} args - Arguments to filter Product_clearances to delete.
     * @example
     * // Delete a few Product_clearances
     * const { count } = await prisma.product_clearance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends product_clearanceDeleteManyArgs>(args?: SelectSubset<T, product_clearanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Product_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Product_clearances
     * const product_clearance = await prisma.product_clearance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends product_clearanceUpdateManyArgs>(args: SelectSubset<T, product_clearanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product_clearance.
     * @param {product_clearanceUpsertArgs} args - Arguments to update or create a Product_clearance.
     * @example
     * // Update or create a Product_clearance
     * const product_clearance = await prisma.product_clearance.upsert({
     *   create: {
     *     // ... data to create a Product_clearance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product_clearance we want to update
     *   }
     * })
     */
    upsert<T extends product_clearanceUpsertArgs>(args: SelectSubset<T, product_clearanceUpsertArgs<ExtArgs>>): Prisma__product_clearanceClient<$Result.GetResult<Prisma.$product_clearancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Product_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceCountArgs} args - Arguments to filter Product_clearances to count.
     * @example
     * // Count the number of Product_clearances
     * const count = await prisma.product_clearance.count({
     *   where: {
     *     // ... the filter for the Product_clearances we want to count
     *   }
     * })
    **/
    count<T extends product_clearanceCountArgs>(
      args?: Subset<T, product_clearanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Product_clearanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Product_clearanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Product_clearanceAggregateArgs>(args: Subset<T, Product_clearanceAggregateArgs>): Prisma.PrismaPromise<GetProduct_clearanceAggregateType<T>>

    /**
     * Group by Product_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_clearanceGroupByArgs} args - Group by arguments.
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
      T extends product_clearanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: product_clearanceGroupByArgs['orderBy'] }
        : { orderBy?: product_clearanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, product_clearanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProduct_clearanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the product_clearance model
   */
  readonly fields: product_clearanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for product_clearance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__product_clearanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the product_clearance model
   */
  interface product_clearanceFieldRefs {
    readonly product_id: FieldRef<"product_clearance", 'Int'>
    readonly category_id: FieldRef<"product_clearance", 'Int'>
    readonly sub_id: FieldRef<"product_clearance", 'Int'>
    readonly part_id: FieldRef<"product_clearance", 'Int'>
    readonly product_name: FieldRef<"product_clearance", 'String'>
    readonly product_brand: FieldRef<"product_clearance", 'String'>
    readonly product_description: FieldRef<"product_clearance", 'String'>
    readonly product_picture: FieldRef<"product_clearance", 'String'>
    readonly product_sku: FieldRef<"product_clearance", 'String'>
    readonly product_file: FieldRef<"product_clearance", 'String'>
    readonly product_filename: FieldRef<"product_clearance", 'String'>
    readonly product_price: FieldRef<"product_clearance", 'Decimal'>
    readonly product_new: FieldRef<"product_clearance", 'Int'>
    readonly product_best: FieldRef<"product_clearance", 'Int'>
    readonly product_status: FieldRef<"product_clearance", 'Int'>
    readonly users_action: FieldRef<"product_clearance", 'Int'>
    readonly created_at: FieldRef<"product_clearance", 'DateTime'>
    readonly updated_at: FieldRef<"product_clearance", 'DateTime'>
    readonly product_uom: FieldRef<"product_clearance", 'String'>
    readonly clearanceSales: FieldRef<"product_clearance", 'Boolean'>
    readonly clearanceQuantity: FieldRef<"product_clearance", 'Int'>
    readonly clearancePrice: FieldRef<"product_clearance", 'Decimal'>
    readonly expo_status: FieldRef<"product_clearance", 'Int'>
    readonly expo_price: FieldRef<"product_clearance", 'Decimal'>
    readonly cat5e: FieldRef<"product_clearance", 'Int'>
    readonly cat6: FieldRef<"product_clearance", 'Int'>
    readonly tool_tester: FieldRef<"product_clearance", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * product_clearance findUnique
   */
  export type product_clearanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which product_clearance to fetch.
     */
    where: product_clearanceWhereUniqueInput
  }

  /**
   * product_clearance findUniqueOrThrow
   */
  export type product_clearanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which product_clearance to fetch.
     */
    where: product_clearanceWhereUniqueInput
  }

  /**
   * product_clearance findFirst
   */
  export type product_clearanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which product_clearance to fetch.
     */
    where?: product_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_clearances to fetch.
     */
    orderBy?: product_clearanceOrderByWithRelationInput | product_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_clearances.
     */
    cursor?: product_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_clearances.
     */
    distinct?: Product_clearanceScalarFieldEnum | Product_clearanceScalarFieldEnum[]
  }

  /**
   * product_clearance findFirstOrThrow
   */
  export type product_clearanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which product_clearance to fetch.
     */
    where?: product_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_clearances to fetch.
     */
    orderBy?: product_clearanceOrderByWithRelationInput | product_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_clearances.
     */
    cursor?: product_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_clearances.
     */
    distinct?: Product_clearanceScalarFieldEnum | Product_clearanceScalarFieldEnum[]
  }

  /**
   * product_clearance findMany
   */
  export type product_clearanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which product_clearances to fetch.
     */
    where?: product_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_clearances to fetch.
     */
    orderBy?: product_clearanceOrderByWithRelationInput | product_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing product_clearances.
     */
    cursor?: product_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_clearances.
     */
    skip?: number
    distinct?: Product_clearanceScalarFieldEnum | Product_clearanceScalarFieldEnum[]
  }

  /**
   * product_clearance create
   */
  export type product_clearanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to create a product_clearance.
     */
    data?: XOR<product_clearanceCreateInput, product_clearanceUncheckedCreateInput>
  }

  /**
   * product_clearance createMany
   */
  export type product_clearanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many product_clearances.
     */
    data: product_clearanceCreateManyInput | product_clearanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * product_clearance update
   */
  export type product_clearanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to update a product_clearance.
     */
    data: XOR<product_clearanceUpdateInput, product_clearanceUncheckedUpdateInput>
    /**
     * Choose, which product_clearance to update.
     */
    where: product_clearanceWhereUniqueInput
  }

  /**
   * product_clearance updateMany
   */
  export type product_clearanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update product_clearances.
     */
    data: XOR<product_clearanceUpdateManyMutationInput, product_clearanceUncheckedUpdateManyInput>
    /**
     * Filter which product_clearances to update
     */
    where?: product_clearanceWhereInput
    /**
     * Limit how many product_clearances to update.
     */
    limit?: number
  }

  /**
   * product_clearance upsert
   */
  export type product_clearanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * The filter to search for the product_clearance to update in case it exists.
     */
    where: product_clearanceWhereUniqueInput
    /**
     * In case the product_clearance found by the `where` argument doesn't exist, create a new product_clearance with this data.
     */
    create: XOR<product_clearanceCreateInput, product_clearanceUncheckedCreateInput>
    /**
     * In case the product_clearance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<product_clearanceUpdateInput, product_clearanceUncheckedUpdateInput>
  }

  /**
   * product_clearance delete
   */
  export type product_clearanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
    /**
     * Filter which product_clearance to delete.
     */
    where: product_clearanceWhereUniqueInput
  }

  /**
   * product_clearance deleteMany
   */
  export type product_clearanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_clearances to delete
     */
    where?: product_clearanceWhereInput
    /**
     * Limit how many product_clearances to delete.
     */
    limit?: number
  }

  /**
   * product_clearance without action
   */
  export type product_clearanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_clearance
     */
    select?: product_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_clearance
     */
    omit?: product_clearanceOmit<ExtArgs> | null
  }


  /**
   * Model product_test_upload
   */

  export type AggregateProduct_test_upload = {
    _count: Product_test_uploadCountAggregateOutputType | null
    _avg: Product_test_uploadAvgAggregateOutputType | null
    _sum: Product_test_uploadSumAggregateOutputType | null
    _min: Product_test_uploadMinAggregateOutputType | null
    _max: Product_test_uploadMaxAggregateOutputType | null
  }

  export type Product_test_uploadAvgAggregateOutputType = {
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

  export type Product_test_uploadSumAggregateOutputType = {
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

  export type Product_test_uploadMinAggregateOutputType = {
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

  export type Product_test_uploadMaxAggregateOutputType = {
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

  export type Product_test_uploadCountAggregateOutputType = {
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


  export type Product_test_uploadAvgAggregateInputType = {
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

  export type Product_test_uploadSumAggregateInputType = {
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

  export type Product_test_uploadMinAggregateInputType = {
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

  export type Product_test_uploadMaxAggregateInputType = {
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

  export type Product_test_uploadCountAggregateInputType = {
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

  export type Product_test_uploadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_test_upload to aggregate.
     */
    where?: product_test_uploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_test_uploads to fetch.
     */
    orderBy?: product_test_uploadOrderByWithRelationInput | product_test_uploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: product_test_uploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_test_uploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_test_uploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned product_test_uploads
    **/
    _count?: true | Product_test_uploadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Product_test_uploadAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Product_test_uploadSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Product_test_uploadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Product_test_uploadMaxAggregateInputType
  }

  export type GetProduct_test_uploadAggregateType<T extends Product_test_uploadAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct_test_upload]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct_test_upload[P]>
      : GetScalarType<T[P], AggregateProduct_test_upload[P]>
  }




  export type product_test_uploadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: product_test_uploadWhereInput
    orderBy?: product_test_uploadOrderByWithAggregationInput | product_test_uploadOrderByWithAggregationInput[]
    by: Product_test_uploadScalarFieldEnum[] | Product_test_uploadScalarFieldEnum
    having?: product_test_uploadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Product_test_uploadCountAggregateInputType | true
    _avg?: Product_test_uploadAvgAggregateInputType
    _sum?: Product_test_uploadSumAggregateInputType
    _min?: Product_test_uploadMinAggregateInputType
    _max?: Product_test_uploadMaxAggregateInputType
  }

  export type Product_test_uploadGroupByOutputType = {
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
    _count: Product_test_uploadCountAggregateOutputType | null
    _avg: Product_test_uploadAvgAggregateOutputType | null
    _sum: Product_test_uploadSumAggregateOutputType | null
    _min: Product_test_uploadMinAggregateOutputType | null
    _max: Product_test_uploadMaxAggregateOutputType | null
  }

  type GetProduct_test_uploadGroupByPayload<T extends product_test_uploadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Product_test_uploadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Product_test_uploadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Product_test_uploadGroupByOutputType[P]>
            : GetScalarType<T[P], Product_test_uploadGroupByOutputType[P]>
        }
      >
    >


  export type product_test_uploadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["product_test_upload"]>



  export type product_test_uploadSelectScalar = {
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

  export type product_test_uploadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"product_id" | "category_id" | "sub_id" | "part_id" | "product_name" | "product_brand" | "product_description" | "product_picture" | "product_sku" | "product_file" | "product_filename" | "product_price" | "product_new" | "product_best" | "product_status" | "users_action" | "created_at" | "updated_at" | "product_uom" | "clearanceSales" | "clearanceQuantity" | "clearancePrice" | "expo_status" | "expo_price" | "cat5e" | "cat6" | "tool_tester", ExtArgs["result"]["product_test_upload"]>

  export type $product_test_uploadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "product_test_upload"
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
       */
      clearanceSales: boolean | null
      clearanceQuantity: number | null
      clearancePrice: Prisma.Decimal | null
      expo_status: number | null
      expo_price: Prisma.Decimal | null
      cat5e: number | null
      cat6: number | null
      tool_tester: number | null
    }, ExtArgs["result"]["product_test_upload"]>
    composites: {}
  }

  type product_test_uploadGetPayload<S extends boolean | null | undefined | product_test_uploadDefaultArgs> = $Result.GetResult<Prisma.$product_test_uploadPayload, S>

  type product_test_uploadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<product_test_uploadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Product_test_uploadCountAggregateInputType | true
    }

  export interface product_test_uploadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['product_test_upload'], meta: { name: 'product_test_upload' } }
    /**
     * Find zero or one Product_test_upload that matches the filter.
     * @param {product_test_uploadFindUniqueArgs} args - Arguments to find a Product_test_upload
     * @example
     * // Get one Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends product_test_uploadFindUniqueArgs>(args: SelectSubset<T, product_test_uploadFindUniqueArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product_test_upload that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {product_test_uploadFindUniqueOrThrowArgs} args - Arguments to find a Product_test_upload
     * @example
     * // Get one Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends product_test_uploadFindUniqueOrThrowArgs>(args: SelectSubset<T, product_test_uploadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_test_upload that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadFindFirstArgs} args - Arguments to find a Product_test_upload
     * @example
     * // Get one Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends product_test_uploadFindFirstArgs>(args?: SelectSubset<T, product_test_uploadFindFirstArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product_test_upload that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadFindFirstOrThrowArgs} args - Arguments to find a Product_test_upload
     * @example
     * // Get one Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends product_test_uploadFindFirstOrThrowArgs>(args?: SelectSubset<T, product_test_uploadFindFirstOrThrowArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Product_test_uploads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Product_test_uploads
     * const product_test_uploads = await prisma.product_test_upload.findMany()
     * 
     * // Get first 10 Product_test_uploads
     * const product_test_uploads = await prisma.product_test_upload.findMany({ take: 10 })
     * 
     * // Only select the `product_id`
     * const product_test_uploadWithProduct_idOnly = await prisma.product_test_upload.findMany({ select: { product_id: true } })
     * 
     */
    findMany<T extends product_test_uploadFindManyArgs>(args?: SelectSubset<T, product_test_uploadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product_test_upload.
     * @param {product_test_uploadCreateArgs} args - Arguments to create a Product_test_upload.
     * @example
     * // Create one Product_test_upload
     * const Product_test_upload = await prisma.product_test_upload.create({
     *   data: {
     *     // ... data to create a Product_test_upload
     *   }
     * })
     * 
     */
    create<T extends product_test_uploadCreateArgs>(args: SelectSubset<T, product_test_uploadCreateArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Product_test_uploads.
     * @param {product_test_uploadCreateManyArgs} args - Arguments to create many Product_test_uploads.
     * @example
     * // Create many Product_test_uploads
     * const product_test_upload = await prisma.product_test_upload.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends product_test_uploadCreateManyArgs>(args?: SelectSubset<T, product_test_uploadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Product_test_upload.
     * @param {product_test_uploadDeleteArgs} args - Arguments to delete one Product_test_upload.
     * @example
     * // Delete one Product_test_upload
     * const Product_test_upload = await prisma.product_test_upload.delete({
     *   where: {
     *     // ... filter to delete one Product_test_upload
     *   }
     * })
     * 
     */
    delete<T extends product_test_uploadDeleteArgs>(args: SelectSubset<T, product_test_uploadDeleteArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product_test_upload.
     * @param {product_test_uploadUpdateArgs} args - Arguments to update one Product_test_upload.
     * @example
     * // Update one Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends product_test_uploadUpdateArgs>(args: SelectSubset<T, product_test_uploadUpdateArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Product_test_uploads.
     * @param {product_test_uploadDeleteManyArgs} args - Arguments to filter Product_test_uploads to delete.
     * @example
     * // Delete a few Product_test_uploads
     * const { count } = await prisma.product_test_upload.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends product_test_uploadDeleteManyArgs>(args?: SelectSubset<T, product_test_uploadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Product_test_uploads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Product_test_uploads
     * const product_test_upload = await prisma.product_test_upload.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends product_test_uploadUpdateManyArgs>(args: SelectSubset<T, product_test_uploadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Product_test_upload.
     * @param {product_test_uploadUpsertArgs} args - Arguments to update or create a Product_test_upload.
     * @example
     * // Update or create a Product_test_upload
     * const product_test_upload = await prisma.product_test_upload.upsert({
     *   create: {
     *     // ... data to create a Product_test_upload
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product_test_upload we want to update
     *   }
     * })
     */
    upsert<T extends product_test_uploadUpsertArgs>(args: SelectSubset<T, product_test_uploadUpsertArgs<ExtArgs>>): Prisma__product_test_uploadClient<$Result.GetResult<Prisma.$product_test_uploadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Product_test_uploads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadCountArgs} args - Arguments to filter Product_test_uploads to count.
     * @example
     * // Count the number of Product_test_uploads
     * const count = await prisma.product_test_upload.count({
     *   where: {
     *     // ... the filter for the Product_test_uploads we want to count
     *   }
     * })
    **/
    count<T extends product_test_uploadCountArgs>(
      args?: Subset<T, product_test_uploadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Product_test_uploadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product_test_upload.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Product_test_uploadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Product_test_uploadAggregateArgs>(args: Subset<T, Product_test_uploadAggregateArgs>): Prisma.PrismaPromise<GetProduct_test_uploadAggregateType<T>>

    /**
     * Group by Product_test_upload.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {product_test_uploadGroupByArgs} args - Group by arguments.
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
      T extends product_test_uploadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: product_test_uploadGroupByArgs['orderBy'] }
        : { orderBy?: product_test_uploadGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, product_test_uploadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProduct_test_uploadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the product_test_upload model
   */
  readonly fields: product_test_uploadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for product_test_upload.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__product_test_uploadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the product_test_upload model
   */
  interface product_test_uploadFieldRefs {
    readonly product_id: FieldRef<"product_test_upload", 'Int'>
    readonly category_id: FieldRef<"product_test_upload", 'Int'>
    readonly sub_id: FieldRef<"product_test_upload", 'Int'>
    readonly part_id: FieldRef<"product_test_upload", 'Int'>
    readonly product_name: FieldRef<"product_test_upload", 'String'>
    readonly product_brand: FieldRef<"product_test_upload", 'String'>
    readonly product_description: FieldRef<"product_test_upload", 'String'>
    readonly product_picture: FieldRef<"product_test_upload", 'String'>
    readonly product_sku: FieldRef<"product_test_upload", 'String'>
    readonly product_file: FieldRef<"product_test_upload", 'String'>
    readonly product_filename: FieldRef<"product_test_upload", 'String'>
    readonly product_price: FieldRef<"product_test_upload", 'Decimal'>
    readonly product_new: FieldRef<"product_test_upload", 'Int'>
    readonly product_best: FieldRef<"product_test_upload", 'Int'>
    readonly product_status: FieldRef<"product_test_upload", 'Int'>
    readonly users_action: FieldRef<"product_test_upload", 'Int'>
    readonly created_at: FieldRef<"product_test_upload", 'DateTime'>
    readonly updated_at: FieldRef<"product_test_upload", 'DateTime'>
    readonly product_uom: FieldRef<"product_test_upload", 'String'>
    readonly clearanceSales: FieldRef<"product_test_upload", 'Boolean'>
    readonly clearanceQuantity: FieldRef<"product_test_upload", 'Int'>
    readonly clearancePrice: FieldRef<"product_test_upload", 'Decimal'>
    readonly expo_status: FieldRef<"product_test_upload", 'Int'>
    readonly expo_price: FieldRef<"product_test_upload", 'Decimal'>
    readonly cat5e: FieldRef<"product_test_upload", 'Int'>
    readonly cat6: FieldRef<"product_test_upload", 'Int'>
    readonly tool_tester: FieldRef<"product_test_upload", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * product_test_upload findUnique
   */
  export type product_test_uploadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter, which product_test_upload to fetch.
     */
    where: product_test_uploadWhereUniqueInput
  }

  /**
   * product_test_upload findUniqueOrThrow
   */
  export type product_test_uploadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter, which product_test_upload to fetch.
     */
    where: product_test_uploadWhereUniqueInput
  }

  /**
   * product_test_upload findFirst
   */
  export type product_test_uploadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter, which product_test_upload to fetch.
     */
    where?: product_test_uploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_test_uploads to fetch.
     */
    orderBy?: product_test_uploadOrderByWithRelationInput | product_test_uploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_test_uploads.
     */
    cursor?: product_test_uploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_test_uploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_test_uploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_test_uploads.
     */
    distinct?: Product_test_uploadScalarFieldEnum | Product_test_uploadScalarFieldEnum[]
  }

  /**
   * product_test_upload findFirstOrThrow
   */
  export type product_test_uploadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter, which product_test_upload to fetch.
     */
    where?: product_test_uploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_test_uploads to fetch.
     */
    orderBy?: product_test_uploadOrderByWithRelationInput | product_test_uploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for product_test_uploads.
     */
    cursor?: product_test_uploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_test_uploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_test_uploads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of product_test_uploads.
     */
    distinct?: Product_test_uploadScalarFieldEnum | Product_test_uploadScalarFieldEnum[]
  }

  /**
   * product_test_upload findMany
   */
  export type product_test_uploadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter, which product_test_uploads to fetch.
     */
    where?: product_test_uploadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of product_test_uploads to fetch.
     */
    orderBy?: product_test_uploadOrderByWithRelationInput | product_test_uploadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing product_test_uploads.
     */
    cursor?: product_test_uploadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` product_test_uploads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` product_test_uploads.
     */
    skip?: number
    distinct?: Product_test_uploadScalarFieldEnum | Product_test_uploadScalarFieldEnum[]
  }

  /**
   * product_test_upload create
   */
  export type product_test_uploadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * The data needed to create a product_test_upload.
     */
    data?: XOR<product_test_uploadCreateInput, product_test_uploadUncheckedCreateInput>
  }

  /**
   * product_test_upload createMany
   */
  export type product_test_uploadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many product_test_uploads.
     */
    data: product_test_uploadCreateManyInput | product_test_uploadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * product_test_upload update
   */
  export type product_test_uploadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * The data needed to update a product_test_upload.
     */
    data: XOR<product_test_uploadUpdateInput, product_test_uploadUncheckedUpdateInput>
    /**
     * Choose, which product_test_upload to update.
     */
    where: product_test_uploadWhereUniqueInput
  }

  /**
   * product_test_upload updateMany
   */
  export type product_test_uploadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update product_test_uploads.
     */
    data: XOR<product_test_uploadUpdateManyMutationInput, product_test_uploadUncheckedUpdateManyInput>
    /**
     * Filter which product_test_uploads to update
     */
    where?: product_test_uploadWhereInput
    /**
     * Limit how many product_test_uploads to update.
     */
    limit?: number
  }

  /**
   * product_test_upload upsert
   */
  export type product_test_uploadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * The filter to search for the product_test_upload to update in case it exists.
     */
    where: product_test_uploadWhereUniqueInput
    /**
     * In case the product_test_upload found by the `where` argument doesn't exist, create a new product_test_upload with this data.
     */
    create: XOR<product_test_uploadCreateInput, product_test_uploadUncheckedCreateInput>
    /**
     * In case the product_test_upload was found with the provided `where` argument, update it with this data.
     */
    update: XOR<product_test_uploadUpdateInput, product_test_uploadUncheckedUpdateInput>
  }

  /**
   * product_test_upload delete
   */
  export type product_test_uploadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
    /**
     * Filter which product_test_upload to delete.
     */
    where: product_test_uploadWhereUniqueInput
  }

  /**
   * product_test_upload deleteMany
   */
  export type product_test_uploadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which product_test_uploads to delete
     */
    where?: product_test_uploadWhereInput
    /**
     * Limit how many product_test_uploads to delete.
     */
    limit?: number
  }

  /**
   * product_test_upload without action
   */
  export type product_test_uploadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the product_test_upload
     */
    select?: product_test_uploadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the product_test_upload
     */
    omit?: product_test_uploadOmit<ExtArgs> | null
  }


  /**
   * Model sub_clearance
   */

  export type AggregateSub_clearance = {
    _count: Sub_clearanceCountAggregateOutputType | null
    _avg: Sub_clearanceAvgAggregateOutputType | null
    _sum: Sub_clearanceSumAggregateOutputType | null
    _min: Sub_clearanceMinAggregateOutputType | null
    _max: Sub_clearanceMaxAggregateOutputType | null
  }

  export type Sub_clearanceAvgAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_status: number | null
    users_action: number | null
  }

  export type Sub_clearanceSumAggregateOutputType = {
    sub_id: number | null
    category_id: number | null
    sub_status: number | null
    users_action: number | null
  }

  export type Sub_clearanceMinAggregateOutputType = {
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

  export type Sub_clearanceMaxAggregateOutputType = {
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

  export type Sub_clearanceCountAggregateOutputType = {
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


  export type Sub_clearanceAvgAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_status?: true
    users_action?: true
  }

  export type Sub_clearanceSumAggregateInputType = {
    sub_id?: true
    category_id?: true
    sub_status?: true
    users_action?: true
  }

  export type Sub_clearanceMinAggregateInputType = {
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

  export type Sub_clearanceMaxAggregateInputType = {
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

  export type Sub_clearanceCountAggregateInputType = {
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

  export type Sub_clearanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sub_clearance to aggregate.
     */
    where?: sub_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sub_clearances to fetch.
     */
    orderBy?: sub_clearanceOrderByWithRelationInput | sub_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: sub_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sub_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sub_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned sub_clearances
    **/
    _count?: true | Sub_clearanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Sub_clearanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Sub_clearanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Sub_clearanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Sub_clearanceMaxAggregateInputType
  }

  export type GetSub_clearanceAggregateType<T extends Sub_clearanceAggregateArgs> = {
        [P in keyof T & keyof AggregateSub_clearance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSub_clearance[P]>
      : GetScalarType<T[P], AggregateSub_clearance[P]>
  }




  export type sub_clearanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: sub_clearanceWhereInput
    orderBy?: sub_clearanceOrderByWithAggregationInput | sub_clearanceOrderByWithAggregationInput[]
    by: Sub_clearanceScalarFieldEnum[] | Sub_clearanceScalarFieldEnum
    having?: sub_clearanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Sub_clearanceCountAggregateInputType | true
    _avg?: Sub_clearanceAvgAggregateInputType
    _sum?: Sub_clearanceSumAggregateInputType
    _min?: Sub_clearanceMinAggregateInputType
    _max?: Sub_clearanceMaxAggregateInputType
  }

  export type Sub_clearanceGroupByOutputType = {
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
    _count: Sub_clearanceCountAggregateOutputType | null
    _avg: Sub_clearanceAvgAggregateOutputType | null
    _sum: Sub_clearanceSumAggregateOutputType | null
    _min: Sub_clearanceMinAggregateOutputType | null
    _max: Sub_clearanceMaxAggregateOutputType | null
  }

  type GetSub_clearanceGroupByPayload<T extends sub_clearanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Sub_clearanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Sub_clearanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Sub_clearanceGroupByOutputType[P]>
            : GetScalarType<T[P], Sub_clearanceGroupByOutputType[P]>
        }
      >
    >


  export type sub_clearanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
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
  }, ExtArgs["result"]["sub_clearance"]>



  export type sub_clearanceSelectScalar = {
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

  export type sub_clearanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"sub_id" | "category_id" | "sub_name" | "sub_keyword" | "sub_title" | "sub_description" | "sub_picture" | "sub_color" | "sub_status" | "users_action" | "created_at" | "updated_at", ExtArgs["result"]["sub_clearance"]>

  export type $sub_clearancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "sub_clearance"
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
    }, ExtArgs["result"]["sub_clearance"]>
    composites: {}
  }

  type sub_clearanceGetPayload<S extends boolean | null | undefined | sub_clearanceDefaultArgs> = $Result.GetResult<Prisma.$sub_clearancePayload, S>

  type sub_clearanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<sub_clearanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Sub_clearanceCountAggregateInputType | true
    }

  export interface sub_clearanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['sub_clearance'], meta: { name: 'sub_clearance' } }
    /**
     * Find zero or one Sub_clearance that matches the filter.
     * @param {sub_clearanceFindUniqueArgs} args - Arguments to find a Sub_clearance
     * @example
     * // Get one Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends sub_clearanceFindUniqueArgs>(args: SelectSubset<T, sub_clearanceFindUniqueArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sub_clearance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {sub_clearanceFindUniqueOrThrowArgs} args - Arguments to find a Sub_clearance
     * @example
     * // Get one Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends sub_clearanceFindUniqueOrThrowArgs>(args: SelectSubset<T, sub_clearanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sub_clearance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceFindFirstArgs} args - Arguments to find a Sub_clearance
     * @example
     * // Get one Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends sub_clearanceFindFirstArgs>(args?: SelectSubset<T, sub_clearanceFindFirstArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sub_clearance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceFindFirstOrThrowArgs} args - Arguments to find a Sub_clearance
     * @example
     * // Get one Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends sub_clearanceFindFirstOrThrowArgs>(args?: SelectSubset<T, sub_clearanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sub_clearances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sub_clearances
     * const sub_clearances = await prisma.sub_clearance.findMany()
     * 
     * // Get first 10 Sub_clearances
     * const sub_clearances = await prisma.sub_clearance.findMany({ take: 10 })
     * 
     * // Only select the `sub_id`
     * const sub_clearanceWithSub_idOnly = await prisma.sub_clearance.findMany({ select: { sub_id: true } })
     * 
     */
    findMany<T extends sub_clearanceFindManyArgs>(args?: SelectSubset<T, sub_clearanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sub_clearance.
     * @param {sub_clearanceCreateArgs} args - Arguments to create a Sub_clearance.
     * @example
     * // Create one Sub_clearance
     * const Sub_clearance = await prisma.sub_clearance.create({
     *   data: {
     *     // ... data to create a Sub_clearance
     *   }
     * })
     * 
     */
    create<T extends sub_clearanceCreateArgs>(args: SelectSubset<T, sub_clearanceCreateArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sub_clearances.
     * @param {sub_clearanceCreateManyArgs} args - Arguments to create many Sub_clearances.
     * @example
     * // Create many Sub_clearances
     * const sub_clearance = await prisma.sub_clearance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends sub_clearanceCreateManyArgs>(args?: SelectSubset<T, sub_clearanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Sub_clearance.
     * @param {sub_clearanceDeleteArgs} args - Arguments to delete one Sub_clearance.
     * @example
     * // Delete one Sub_clearance
     * const Sub_clearance = await prisma.sub_clearance.delete({
     *   where: {
     *     // ... filter to delete one Sub_clearance
     *   }
     * })
     * 
     */
    delete<T extends sub_clearanceDeleteArgs>(args: SelectSubset<T, sub_clearanceDeleteArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sub_clearance.
     * @param {sub_clearanceUpdateArgs} args - Arguments to update one Sub_clearance.
     * @example
     * // Update one Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends sub_clearanceUpdateArgs>(args: SelectSubset<T, sub_clearanceUpdateArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sub_clearances.
     * @param {sub_clearanceDeleteManyArgs} args - Arguments to filter Sub_clearances to delete.
     * @example
     * // Delete a few Sub_clearances
     * const { count } = await prisma.sub_clearance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends sub_clearanceDeleteManyArgs>(args?: SelectSubset<T, sub_clearanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sub_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sub_clearances
     * const sub_clearance = await prisma.sub_clearance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends sub_clearanceUpdateManyArgs>(args: SelectSubset<T, sub_clearanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sub_clearance.
     * @param {sub_clearanceUpsertArgs} args - Arguments to update or create a Sub_clearance.
     * @example
     * // Update or create a Sub_clearance
     * const sub_clearance = await prisma.sub_clearance.upsert({
     *   create: {
     *     // ... data to create a Sub_clearance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sub_clearance we want to update
     *   }
     * })
     */
    upsert<T extends sub_clearanceUpsertArgs>(args: SelectSubset<T, sub_clearanceUpsertArgs<ExtArgs>>): Prisma__sub_clearanceClient<$Result.GetResult<Prisma.$sub_clearancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sub_clearances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceCountArgs} args - Arguments to filter Sub_clearances to count.
     * @example
     * // Count the number of Sub_clearances
     * const count = await prisma.sub_clearance.count({
     *   where: {
     *     // ... the filter for the Sub_clearances we want to count
     *   }
     * })
    **/
    count<T extends sub_clearanceCountArgs>(
      args?: Subset<T, sub_clearanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Sub_clearanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sub_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Sub_clearanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Sub_clearanceAggregateArgs>(args: Subset<T, Sub_clearanceAggregateArgs>): Prisma.PrismaPromise<GetSub_clearanceAggregateType<T>>

    /**
     * Group by Sub_clearance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sub_clearanceGroupByArgs} args - Group by arguments.
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
      T extends sub_clearanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: sub_clearanceGroupByArgs['orderBy'] }
        : { orderBy?: sub_clearanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, sub_clearanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSub_clearanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the sub_clearance model
   */
  readonly fields: sub_clearanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for sub_clearance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__sub_clearanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the sub_clearance model
   */
  interface sub_clearanceFieldRefs {
    readonly sub_id: FieldRef<"sub_clearance", 'Int'>
    readonly category_id: FieldRef<"sub_clearance", 'Int'>
    readonly sub_name: FieldRef<"sub_clearance", 'String'>
    readonly sub_keyword: FieldRef<"sub_clearance", 'String'>
    readonly sub_title: FieldRef<"sub_clearance", 'String'>
    readonly sub_description: FieldRef<"sub_clearance", 'String'>
    readonly sub_picture: FieldRef<"sub_clearance", 'String'>
    readonly sub_color: FieldRef<"sub_clearance", 'String'>
    readonly sub_status: FieldRef<"sub_clearance", 'Int'>
    readonly users_action: FieldRef<"sub_clearance", 'Int'>
    readonly created_at: FieldRef<"sub_clearance", 'DateTime'>
    readonly updated_at: FieldRef<"sub_clearance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * sub_clearance findUnique
   */
  export type sub_clearanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which sub_clearance to fetch.
     */
    where: sub_clearanceWhereUniqueInput
  }

  /**
   * sub_clearance findUniqueOrThrow
   */
  export type sub_clearanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which sub_clearance to fetch.
     */
    where: sub_clearanceWhereUniqueInput
  }

  /**
   * sub_clearance findFirst
   */
  export type sub_clearanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which sub_clearance to fetch.
     */
    where?: sub_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sub_clearances to fetch.
     */
    orderBy?: sub_clearanceOrderByWithRelationInput | sub_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sub_clearances.
     */
    cursor?: sub_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sub_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sub_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sub_clearances.
     */
    distinct?: Sub_clearanceScalarFieldEnum | Sub_clearanceScalarFieldEnum[]
  }

  /**
   * sub_clearance findFirstOrThrow
   */
  export type sub_clearanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which sub_clearance to fetch.
     */
    where?: sub_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sub_clearances to fetch.
     */
    orderBy?: sub_clearanceOrderByWithRelationInput | sub_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sub_clearances.
     */
    cursor?: sub_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sub_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sub_clearances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sub_clearances.
     */
    distinct?: Sub_clearanceScalarFieldEnum | Sub_clearanceScalarFieldEnum[]
  }

  /**
   * sub_clearance findMany
   */
  export type sub_clearanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter, which sub_clearances to fetch.
     */
    where?: sub_clearanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sub_clearances to fetch.
     */
    orderBy?: sub_clearanceOrderByWithRelationInput | sub_clearanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing sub_clearances.
     */
    cursor?: sub_clearanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sub_clearances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sub_clearances.
     */
    skip?: number
    distinct?: Sub_clearanceScalarFieldEnum | Sub_clearanceScalarFieldEnum[]
  }

  /**
   * sub_clearance create
   */
  export type sub_clearanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to create a sub_clearance.
     */
    data: XOR<sub_clearanceCreateInput, sub_clearanceUncheckedCreateInput>
  }

  /**
   * sub_clearance createMany
   */
  export type sub_clearanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many sub_clearances.
     */
    data: sub_clearanceCreateManyInput | sub_clearanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * sub_clearance update
   */
  export type sub_clearanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * The data needed to update a sub_clearance.
     */
    data: XOR<sub_clearanceUpdateInput, sub_clearanceUncheckedUpdateInput>
    /**
     * Choose, which sub_clearance to update.
     */
    where: sub_clearanceWhereUniqueInput
  }

  /**
   * sub_clearance updateMany
   */
  export type sub_clearanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update sub_clearances.
     */
    data: XOR<sub_clearanceUpdateManyMutationInput, sub_clearanceUncheckedUpdateManyInput>
    /**
     * Filter which sub_clearances to update
     */
    where?: sub_clearanceWhereInput
    /**
     * Limit how many sub_clearances to update.
     */
    limit?: number
  }

  /**
   * sub_clearance upsert
   */
  export type sub_clearanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * The filter to search for the sub_clearance to update in case it exists.
     */
    where: sub_clearanceWhereUniqueInput
    /**
     * In case the sub_clearance found by the `where` argument doesn't exist, create a new sub_clearance with this data.
     */
    create: XOR<sub_clearanceCreateInput, sub_clearanceUncheckedCreateInput>
    /**
     * In case the sub_clearance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<sub_clearanceUpdateInput, sub_clearanceUncheckedUpdateInput>
  }

  /**
   * sub_clearance delete
   */
  export type sub_clearanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
    /**
     * Filter which sub_clearance to delete.
     */
    where: sub_clearanceWhereUniqueInput
  }

  /**
   * sub_clearance deleteMany
   */
  export type sub_clearanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sub_clearances to delete
     */
    where?: sub_clearanceWhereInput
    /**
     * Limit how many sub_clearances to delete.
     */
    limit?: number
  }

  /**
   * sub_clearance without action
   */
  export type sub_clearanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sub_clearance
     */
    select?: sub_clearanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sub_clearance
     */
    omit?: sub_clearanceOmit<ExtArgs> | null
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


  export const Category_clearanceScalarFieldEnum: {
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

  export type Category_clearanceScalarFieldEnum = (typeof Category_clearanceScalarFieldEnum)[keyof typeof Category_clearanceScalarFieldEnum]


  export const Discountpercentage_clearance_tbScalarFieldEnum: {
    dcp_id: 'dcp_id',
    product_id: 'product_id',
    product_discount: 'product_discount',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type Discountpercentage_clearance_tbScalarFieldEnum = (typeof Discountpercentage_clearance_tbScalarFieldEnum)[keyof typeof Discountpercentage_clearance_tbScalarFieldEnum]


  export const Discountpercentage_tbScalarFieldEnum: {
    dcp_id: 'dcp_id',
    product_id: 'product_id',
    product_discount: 'product_discount',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type Discountpercentage_tbScalarFieldEnum = (typeof Discountpercentage_tbScalarFieldEnum)[keyof typeof Discountpercentage_tbScalarFieldEnum]


  export const More_pictures_clearanceScalarFieldEnum: {
    mpc_id: 'mpc_id',
    product_id: 'product_id',
    product_picture: 'product_picture',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type More_pictures_clearanceScalarFieldEnum = (typeof More_pictures_clearanceScalarFieldEnum)[keyof typeof More_pictures_clearanceScalarFieldEnum]


  export const More_pictures_testScalarFieldEnum: {
    mpt_id: 'mpt_id',
    product_id: 'product_id',
    product_picture: 'product_picture',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type More_pictures_testScalarFieldEnum = (typeof More_pictures_testScalarFieldEnum)[keyof typeof More_pictures_testScalarFieldEnum]


  export const Part_clearanceScalarFieldEnum: {
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

  export type Part_clearanceScalarFieldEnum = (typeof Part_clearanceScalarFieldEnum)[keyof typeof Part_clearanceScalarFieldEnum]


  export const Producoptions_clearance_tbScalarFieldEnum: {
    pot_id: 'pot_id',
    product_id: 'product_id',
    product_option: 'product_option',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type Producoptions_clearance_tbScalarFieldEnum = (typeof Producoptions_clearance_tbScalarFieldEnum)[keyof typeof Producoptions_clearance_tbScalarFieldEnum]


  export const Producoptions_tbScalarFieldEnum: {
    pot_id: 'pot_id',
    product_id: 'product_id',
    product_option: 'product_option',
    create_date: 'create_date',
    create_name: 'create_name',
    update_date: 'update_date',
    update_name: 'update_name'
  };

  export type Producoptions_tbScalarFieldEnum = (typeof Producoptions_tbScalarFieldEnum)[keyof typeof Producoptions_tbScalarFieldEnum]


  export const Product_clearanceScalarFieldEnum: {
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

  export type Product_clearanceScalarFieldEnum = (typeof Product_clearanceScalarFieldEnum)[keyof typeof Product_clearanceScalarFieldEnum]


  export const Product_test_uploadScalarFieldEnum: {
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

  export type Product_test_uploadScalarFieldEnum = (typeof Product_test_uploadScalarFieldEnum)[keyof typeof Product_test_uploadScalarFieldEnum]


  export const Sub_clearanceScalarFieldEnum: {
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

  export type Sub_clearanceScalarFieldEnum = (typeof Sub_clearanceScalarFieldEnum)[keyof typeof Sub_clearanceScalarFieldEnum]


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


  export const category_clearanceOrderByRelevanceFieldEnum: {
    category_name: 'category_name',
    category_keyword: 'category_keyword',
    category_title: 'category_title',
    category_description: 'category_description',
    category_color: 'category_color',
    category_picture: 'category_picture'
  };

  export type category_clearanceOrderByRelevanceFieldEnum = (typeof category_clearanceOrderByRelevanceFieldEnum)[keyof typeof category_clearanceOrderByRelevanceFieldEnum]


  export const discountpercentage_clearance_tbOrderByRelevanceFieldEnum: {
    product_discount: 'product_discount',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type discountpercentage_clearance_tbOrderByRelevanceFieldEnum = (typeof discountpercentage_clearance_tbOrderByRelevanceFieldEnum)[keyof typeof discountpercentage_clearance_tbOrderByRelevanceFieldEnum]


  export const discountpercentage_tbOrderByRelevanceFieldEnum: {
    product_discount: 'product_discount',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type discountpercentage_tbOrderByRelevanceFieldEnum = (typeof discountpercentage_tbOrderByRelevanceFieldEnum)[keyof typeof discountpercentage_tbOrderByRelevanceFieldEnum]


  export const more_pictures_clearanceOrderByRelevanceFieldEnum: {
    product_picture: 'product_picture',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type more_pictures_clearanceOrderByRelevanceFieldEnum = (typeof more_pictures_clearanceOrderByRelevanceFieldEnum)[keyof typeof more_pictures_clearanceOrderByRelevanceFieldEnum]


  export const more_pictures_testOrderByRelevanceFieldEnum: {
    product_picture: 'product_picture',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type more_pictures_testOrderByRelevanceFieldEnum = (typeof more_pictures_testOrderByRelevanceFieldEnum)[keyof typeof more_pictures_testOrderByRelevanceFieldEnum]


  export const part_clearanceOrderByRelevanceFieldEnum: {
    part_name: 'part_name',
    part_picture: 'part_picture',
    part_color: 'part_color'
  };

  export type part_clearanceOrderByRelevanceFieldEnum = (typeof part_clearanceOrderByRelevanceFieldEnum)[keyof typeof part_clearanceOrderByRelevanceFieldEnum]


  export const producoptions_clearance_tbOrderByRelevanceFieldEnum: {
    product_option: 'product_option',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type producoptions_clearance_tbOrderByRelevanceFieldEnum = (typeof producoptions_clearance_tbOrderByRelevanceFieldEnum)[keyof typeof producoptions_clearance_tbOrderByRelevanceFieldEnum]


  export const producoptions_tbOrderByRelevanceFieldEnum: {
    product_option: 'product_option',
    create_name: 'create_name',
    update_name: 'update_name'
  };

  export type producoptions_tbOrderByRelevanceFieldEnum = (typeof producoptions_tbOrderByRelevanceFieldEnum)[keyof typeof producoptions_tbOrderByRelevanceFieldEnum]


  export const product_clearanceOrderByRelevanceFieldEnum: {
    product_name: 'product_name',
    product_brand: 'product_brand',
    product_description: 'product_description',
    product_picture: 'product_picture',
    product_sku: 'product_sku',
    product_file: 'product_file',
    product_filename: 'product_filename',
    product_uom: 'product_uom'
  };

  export type product_clearanceOrderByRelevanceFieldEnum = (typeof product_clearanceOrderByRelevanceFieldEnum)[keyof typeof product_clearanceOrderByRelevanceFieldEnum]


  export const product_test_uploadOrderByRelevanceFieldEnum: {
    product_name: 'product_name',
    product_brand: 'product_brand',
    product_description: 'product_description',
    product_picture: 'product_picture',
    product_sku: 'product_sku',
    product_file: 'product_file',
    product_filename: 'product_filename',
    product_uom: 'product_uom'
  };

  export type product_test_uploadOrderByRelevanceFieldEnum = (typeof product_test_uploadOrderByRelevanceFieldEnum)[keyof typeof product_test_uploadOrderByRelevanceFieldEnum]


  export const sub_clearanceOrderByRelevanceFieldEnum: {
    sub_name: 'sub_name',
    sub_keyword: 'sub_keyword',
    sub_title: 'sub_title',
    sub_description: 'sub_description',
    sub_picture: 'sub_picture',
    sub_color: 'sub_color'
  };

  export type sub_clearanceOrderByRelevanceFieldEnum = (typeof sub_clearanceOrderByRelevanceFieldEnum)[keyof typeof sub_clearanceOrderByRelevanceFieldEnum]


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

  export type category_clearanceWhereInput = {
    AND?: category_clearanceWhereInput | category_clearanceWhereInput[]
    OR?: category_clearanceWhereInput[]
    NOT?: category_clearanceWhereInput | category_clearanceWhereInput[]
    category_id?: IntFilter<"category_clearance"> | number
    category_name?: StringFilter<"category_clearance"> | string
    category_number?: IntFilter<"category_clearance"> | number
    category_keyword?: StringNullableFilter<"category_clearance"> | string | null
    category_title?: StringNullableFilter<"category_clearance"> | string | null
    category_description?: StringNullableFilter<"category_clearance"> | string | null
    category_color?: StringNullableFilter<"category_clearance"> | string | null
    category_picture?: StringNullableFilter<"category_clearance"> | string | null
    category_status?: IntFilter<"category_clearance"> | number
    users_action?: IntFilter<"category_clearance"> | number
    created_at?: DateTimeFilter<"category_clearance"> | Date | string
    updated_at?: DateTimeFilter<"category_clearance"> | Date | string
  }

  export type category_clearanceOrderByWithRelationInput = {
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
    _relevance?: category_clearanceOrderByRelevanceInput
  }

  export type category_clearanceWhereUniqueInput = Prisma.AtLeast<{
    category_id?: number
    AND?: category_clearanceWhereInput | category_clearanceWhereInput[]
    OR?: category_clearanceWhereInput[]
    NOT?: category_clearanceWhereInput | category_clearanceWhereInput[]
    category_name?: StringFilter<"category_clearance"> | string
    category_number?: IntFilter<"category_clearance"> | number
    category_keyword?: StringNullableFilter<"category_clearance"> | string | null
    category_title?: StringNullableFilter<"category_clearance"> | string | null
    category_description?: StringNullableFilter<"category_clearance"> | string | null
    category_color?: StringNullableFilter<"category_clearance"> | string | null
    category_picture?: StringNullableFilter<"category_clearance"> | string | null
    category_status?: IntFilter<"category_clearance"> | number
    users_action?: IntFilter<"category_clearance"> | number
    created_at?: DateTimeFilter<"category_clearance"> | Date | string
    updated_at?: DateTimeFilter<"category_clearance"> | Date | string
  }, "category_id">

  export type category_clearanceOrderByWithAggregationInput = {
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
    _count?: category_clearanceCountOrderByAggregateInput
    _avg?: category_clearanceAvgOrderByAggregateInput
    _max?: category_clearanceMaxOrderByAggregateInput
    _min?: category_clearanceMinOrderByAggregateInput
    _sum?: category_clearanceSumOrderByAggregateInput
  }

  export type category_clearanceScalarWhereWithAggregatesInput = {
    AND?: category_clearanceScalarWhereWithAggregatesInput | category_clearanceScalarWhereWithAggregatesInput[]
    OR?: category_clearanceScalarWhereWithAggregatesInput[]
    NOT?: category_clearanceScalarWhereWithAggregatesInput | category_clearanceScalarWhereWithAggregatesInput[]
    category_id?: IntWithAggregatesFilter<"category_clearance"> | number
    category_name?: StringWithAggregatesFilter<"category_clearance"> | string
    category_number?: IntWithAggregatesFilter<"category_clearance"> | number
    category_keyword?: StringNullableWithAggregatesFilter<"category_clearance"> | string | null
    category_title?: StringNullableWithAggregatesFilter<"category_clearance"> | string | null
    category_description?: StringNullableWithAggregatesFilter<"category_clearance"> | string | null
    category_color?: StringNullableWithAggregatesFilter<"category_clearance"> | string | null
    category_picture?: StringNullableWithAggregatesFilter<"category_clearance"> | string | null
    category_status?: IntWithAggregatesFilter<"category_clearance"> | number
    users_action?: IntWithAggregatesFilter<"category_clearance"> | number
    created_at?: DateTimeWithAggregatesFilter<"category_clearance"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"category_clearance"> | Date | string
  }

  export type discountpercentage_clearance_tbWhereInput = {
    AND?: discountpercentage_clearance_tbWhereInput | discountpercentage_clearance_tbWhereInput[]
    OR?: discountpercentage_clearance_tbWhereInput[]
    NOT?: discountpercentage_clearance_tbWhereInput | discountpercentage_clearance_tbWhereInput[]
    dcp_id?: BigIntFilter<"discountpercentage_clearance_tb"> | bigint | number
    product_id?: IntFilter<"discountpercentage_clearance_tb"> | number
    product_discount?: StringFilter<"discountpercentage_clearance_tb"> | string
    create_date?: DateTimeFilter<"discountpercentage_clearance_tb"> | Date | string
    create_name?: StringFilter<"discountpercentage_clearance_tb"> | string
    update_date?: DateTimeFilter<"discountpercentage_clearance_tb"> | Date | string
    update_name?: StringFilter<"discountpercentage_clearance_tb"> | string
  }

  export type discountpercentage_clearance_tbOrderByWithRelationInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: discountpercentage_clearance_tbOrderByRelevanceInput
  }

  export type discountpercentage_clearance_tbWhereUniqueInput = Prisma.AtLeast<{
    dcp_id?: bigint | number
    AND?: discountpercentage_clearance_tbWhereInput | discountpercentage_clearance_tbWhereInput[]
    OR?: discountpercentage_clearance_tbWhereInput[]
    NOT?: discountpercentage_clearance_tbWhereInput | discountpercentage_clearance_tbWhereInput[]
    product_id?: IntFilter<"discountpercentage_clearance_tb"> | number
    product_discount?: StringFilter<"discountpercentage_clearance_tb"> | string
    create_date?: DateTimeFilter<"discountpercentage_clearance_tb"> | Date | string
    create_name?: StringFilter<"discountpercentage_clearance_tb"> | string
    update_date?: DateTimeFilter<"discountpercentage_clearance_tb"> | Date | string
    update_name?: StringFilter<"discountpercentage_clearance_tb"> | string
  }, "dcp_id">

  export type discountpercentage_clearance_tbOrderByWithAggregationInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: discountpercentage_clearance_tbCountOrderByAggregateInput
    _avg?: discountpercentage_clearance_tbAvgOrderByAggregateInput
    _max?: discountpercentage_clearance_tbMaxOrderByAggregateInput
    _min?: discountpercentage_clearance_tbMinOrderByAggregateInput
    _sum?: discountpercentage_clearance_tbSumOrderByAggregateInput
  }

  export type discountpercentage_clearance_tbScalarWhereWithAggregatesInput = {
    AND?: discountpercentage_clearance_tbScalarWhereWithAggregatesInput | discountpercentage_clearance_tbScalarWhereWithAggregatesInput[]
    OR?: discountpercentage_clearance_tbScalarWhereWithAggregatesInput[]
    NOT?: discountpercentage_clearance_tbScalarWhereWithAggregatesInput | discountpercentage_clearance_tbScalarWhereWithAggregatesInput[]
    dcp_id?: BigIntWithAggregatesFilter<"discountpercentage_clearance_tb"> | bigint | number
    product_id?: IntWithAggregatesFilter<"discountpercentage_clearance_tb"> | number
    product_discount?: StringWithAggregatesFilter<"discountpercentage_clearance_tb"> | string
    create_date?: DateTimeWithAggregatesFilter<"discountpercentage_clearance_tb"> | Date | string
    create_name?: StringWithAggregatesFilter<"discountpercentage_clearance_tb"> | string
    update_date?: DateTimeWithAggregatesFilter<"discountpercentage_clearance_tb"> | Date | string
    update_name?: StringWithAggregatesFilter<"discountpercentage_clearance_tb"> | string
  }

  export type discountpercentage_tbWhereInput = {
    AND?: discountpercentage_tbWhereInput | discountpercentage_tbWhereInput[]
    OR?: discountpercentage_tbWhereInput[]
    NOT?: discountpercentage_tbWhereInput | discountpercentage_tbWhereInput[]
    dcp_id?: BigIntFilter<"discountpercentage_tb"> | bigint | number
    product_id?: IntFilter<"discountpercentage_tb"> | number
    product_discount?: StringFilter<"discountpercentage_tb"> | string
    create_date?: DateTimeFilter<"discountpercentage_tb"> | Date | string
    create_name?: StringFilter<"discountpercentage_tb"> | string
    update_date?: DateTimeFilter<"discountpercentage_tb"> | Date | string
    update_name?: StringFilter<"discountpercentage_tb"> | string
  }

  export type discountpercentage_tbOrderByWithRelationInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: discountpercentage_tbOrderByRelevanceInput
  }

  export type discountpercentage_tbWhereUniqueInput = Prisma.AtLeast<{
    dcp_id?: bigint | number
    AND?: discountpercentage_tbWhereInput | discountpercentage_tbWhereInput[]
    OR?: discountpercentage_tbWhereInput[]
    NOT?: discountpercentage_tbWhereInput | discountpercentage_tbWhereInput[]
    product_id?: IntFilter<"discountpercentage_tb"> | number
    product_discount?: StringFilter<"discountpercentage_tb"> | string
    create_date?: DateTimeFilter<"discountpercentage_tb"> | Date | string
    create_name?: StringFilter<"discountpercentage_tb"> | string
    update_date?: DateTimeFilter<"discountpercentage_tb"> | Date | string
    update_name?: StringFilter<"discountpercentage_tb"> | string
  }, "dcp_id">

  export type discountpercentage_tbOrderByWithAggregationInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: discountpercentage_tbCountOrderByAggregateInput
    _avg?: discountpercentage_tbAvgOrderByAggregateInput
    _max?: discountpercentage_tbMaxOrderByAggregateInput
    _min?: discountpercentage_tbMinOrderByAggregateInput
    _sum?: discountpercentage_tbSumOrderByAggregateInput
  }

  export type discountpercentage_tbScalarWhereWithAggregatesInput = {
    AND?: discountpercentage_tbScalarWhereWithAggregatesInput | discountpercentage_tbScalarWhereWithAggregatesInput[]
    OR?: discountpercentage_tbScalarWhereWithAggregatesInput[]
    NOT?: discountpercentage_tbScalarWhereWithAggregatesInput | discountpercentage_tbScalarWhereWithAggregatesInput[]
    dcp_id?: BigIntWithAggregatesFilter<"discountpercentage_tb"> | bigint | number
    product_id?: IntWithAggregatesFilter<"discountpercentage_tb"> | number
    product_discount?: StringWithAggregatesFilter<"discountpercentage_tb"> | string
    create_date?: DateTimeWithAggregatesFilter<"discountpercentage_tb"> | Date | string
    create_name?: StringWithAggregatesFilter<"discountpercentage_tb"> | string
    update_date?: DateTimeWithAggregatesFilter<"discountpercentage_tb"> | Date | string
    update_name?: StringWithAggregatesFilter<"discountpercentage_tb"> | string
  }

  export type more_pictures_clearanceWhereInput = {
    AND?: more_pictures_clearanceWhereInput | more_pictures_clearanceWhereInput[]
    OR?: more_pictures_clearanceWhereInput[]
    NOT?: more_pictures_clearanceWhereInput | more_pictures_clearanceWhereInput[]
    mpc_id?: BigIntFilter<"more_pictures_clearance"> | bigint | number
    product_id?: IntFilter<"more_pictures_clearance"> | number
    product_picture?: StringFilter<"more_pictures_clearance"> | string
    create_date?: DateTimeFilter<"more_pictures_clearance"> | Date | string
    create_name?: StringFilter<"more_pictures_clearance"> | string
    update_date?: DateTimeFilter<"more_pictures_clearance"> | Date | string
    update_name?: StringFilter<"more_pictures_clearance"> | string
  }

  export type more_pictures_clearanceOrderByWithRelationInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: more_pictures_clearanceOrderByRelevanceInput
  }

  export type more_pictures_clearanceWhereUniqueInput = Prisma.AtLeast<{
    mpc_id?: bigint | number
    AND?: more_pictures_clearanceWhereInput | more_pictures_clearanceWhereInput[]
    OR?: more_pictures_clearanceWhereInput[]
    NOT?: more_pictures_clearanceWhereInput | more_pictures_clearanceWhereInput[]
    product_id?: IntFilter<"more_pictures_clearance"> | number
    product_picture?: StringFilter<"more_pictures_clearance"> | string
    create_date?: DateTimeFilter<"more_pictures_clearance"> | Date | string
    create_name?: StringFilter<"more_pictures_clearance"> | string
    update_date?: DateTimeFilter<"more_pictures_clearance"> | Date | string
    update_name?: StringFilter<"more_pictures_clearance"> | string
  }, "mpc_id">

  export type more_pictures_clearanceOrderByWithAggregationInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: more_pictures_clearanceCountOrderByAggregateInput
    _avg?: more_pictures_clearanceAvgOrderByAggregateInput
    _max?: more_pictures_clearanceMaxOrderByAggregateInput
    _min?: more_pictures_clearanceMinOrderByAggregateInput
    _sum?: more_pictures_clearanceSumOrderByAggregateInput
  }

  export type more_pictures_clearanceScalarWhereWithAggregatesInput = {
    AND?: more_pictures_clearanceScalarWhereWithAggregatesInput | more_pictures_clearanceScalarWhereWithAggregatesInput[]
    OR?: more_pictures_clearanceScalarWhereWithAggregatesInput[]
    NOT?: more_pictures_clearanceScalarWhereWithAggregatesInput | more_pictures_clearanceScalarWhereWithAggregatesInput[]
    mpc_id?: BigIntWithAggregatesFilter<"more_pictures_clearance"> | bigint | number
    product_id?: IntWithAggregatesFilter<"more_pictures_clearance"> | number
    product_picture?: StringWithAggregatesFilter<"more_pictures_clearance"> | string
    create_date?: DateTimeWithAggregatesFilter<"more_pictures_clearance"> | Date | string
    create_name?: StringWithAggregatesFilter<"more_pictures_clearance"> | string
    update_date?: DateTimeWithAggregatesFilter<"more_pictures_clearance"> | Date | string
    update_name?: StringWithAggregatesFilter<"more_pictures_clearance"> | string
  }

  export type more_pictures_testWhereInput = {
    AND?: more_pictures_testWhereInput | more_pictures_testWhereInput[]
    OR?: more_pictures_testWhereInput[]
    NOT?: more_pictures_testWhereInput | more_pictures_testWhereInput[]
    mpt_id?: BigIntFilter<"more_pictures_test"> | bigint | number
    product_id?: IntFilter<"more_pictures_test"> | number
    product_picture?: StringFilter<"more_pictures_test"> | string
    create_date?: DateTimeFilter<"more_pictures_test"> | Date | string
    create_name?: StringFilter<"more_pictures_test"> | string
    update_date?: DateTimeFilter<"more_pictures_test"> | Date | string
    update_name?: StringFilter<"more_pictures_test"> | string
  }

  export type more_pictures_testOrderByWithRelationInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: more_pictures_testOrderByRelevanceInput
  }

  export type more_pictures_testWhereUniqueInput = Prisma.AtLeast<{
    mpt_id?: bigint | number
    AND?: more_pictures_testWhereInput | more_pictures_testWhereInput[]
    OR?: more_pictures_testWhereInput[]
    NOT?: more_pictures_testWhereInput | more_pictures_testWhereInput[]
    product_id?: IntFilter<"more_pictures_test"> | number
    product_picture?: StringFilter<"more_pictures_test"> | string
    create_date?: DateTimeFilter<"more_pictures_test"> | Date | string
    create_name?: StringFilter<"more_pictures_test"> | string
    update_date?: DateTimeFilter<"more_pictures_test"> | Date | string
    update_name?: StringFilter<"more_pictures_test"> | string
  }, "mpt_id">

  export type more_pictures_testOrderByWithAggregationInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: more_pictures_testCountOrderByAggregateInput
    _avg?: more_pictures_testAvgOrderByAggregateInput
    _max?: more_pictures_testMaxOrderByAggregateInput
    _min?: more_pictures_testMinOrderByAggregateInput
    _sum?: more_pictures_testSumOrderByAggregateInput
  }

  export type more_pictures_testScalarWhereWithAggregatesInput = {
    AND?: more_pictures_testScalarWhereWithAggregatesInput | more_pictures_testScalarWhereWithAggregatesInput[]
    OR?: more_pictures_testScalarWhereWithAggregatesInput[]
    NOT?: more_pictures_testScalarWhereWithAggregatesInput | more_pictures_testScalarWhereWithAggregatesInput[]
    mpt_id?: BigIntWithAggregatesFilter<"more_pictures_test"> | bigint | number
    product_id?: IntWithAggregatesFilter<"more_pictures_test"> | number
    product_picture?: StringWithAggregatesFilter<"more_pictures_test"> | string
    create_date?: DateTimeWithAggregatesFilter<"more_pictures_test"> | Date | string
    create_name?: StringWithAggregatesFilter<"more_pictures_test"> | string
    update_date?: DateTimeWithAggregatesFilter<"more_pictures_test"> | Date | string
    update_name?: StringWithAggregatesFilter<"more_pictures_test"> | string
  }

  export type part_clearanceWhereInput = {
    AND?: part_clearanceWhereInput | part_clearanceWhereInput[]
    OR?: part_clearanceWhereInput[]
    NOT?: part_clearanceWhereInput | part_clearanceWhereInput[]
    part_id?: IntFilter<"part_clearance"> | number
    category_id?: IntFilter<"part_clearance"> | number
    sub_id?: IntFilter<"part_clearance"> | number
    part_name?: StringFilter<"part_clearance"> | string
    part_picture?: StringNullableFilter<"part_clearance"> | string | null
    part_color?: StringNullableFilter<"part_clearance"> | string | null
    part_status?: IntFilter<"part_clearance"> | number
    users_action?: IntFilter<"part_clearance"> | number
    created_at?: DateTimeFilter<"part_clearance"> | Date | string
    updated_at?: DateTimeFilter<"part_clearance"> | Date | string
  }

  export type part_clearanceOrderByWithRelationInput = {
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
    _relevance?: part_clearanceOrderByRelevanceInput
  }

  export type part_clearanceWhereUniqueInput = Prisma.AtLeast<{
    part_id?: number
    AND?: part_clearanceWhereInput | part_clearanceWhereInput[]
    OR?: part_clearanceWhereInput[]
    NOT?: part_clearanceWhereInput | part_clearanceWhereInput[]
    category_id?: IntFilter<"part_clearance"> | number
    sub_id?: IntFilter<"part_clearance"> | number
    part_name?: StringFilter<"part_clearance"> | string
    part_picture?: StringNullableFilter<"part_clearance"> | string | null
    part_color?: StringNullableFilter<"part_clearance"> | string | null
    part_status?: IntFilter<"part_clearance"> | number
    users_action?: IntFilter<"part_clearance"> | number
    created_at?: DateTimeFilter<"part_clearance"> | Date | string
    updated_at?: DateTimeFilter<"part_clearance"> | Date | string
  }, "part_id">

  export type part_clearanceOrderByWithAggregationInput = {
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
    _count?: part_clearanceCountOrderByAggregateInput
    _avg?: part_clearanceAvgOrderByAggregateInput
    _max?: part_clearanceMaxOrderByAggregateInput
    _min?: part_clearanceMinOrderByAggregateInput
    _sum?: part_clearanceSumOrderByAggregateInput
  }

  export type part_clearanceScalarWhereWithAggregatesInput = {
    AND?: part_clearanceScalarWhereWithAggregatesInput | part_clearanceScalarWhereWithAggregatesInput[]
    OR?: part_clearanceScalarWhereWithAggregatesInput[]
    NOT?: part_clearanceScalarWhereWithAggregatesInput | part_clearanceScalarWhereWithAggregatesInput[]
    part_id?: IntWithAggregatesFilter<"part_clearance"> | number
    category_id?: IntWithAggregatesFilter<"part_clearance"> | number
    sub_id?: IntWithAggregatesFilter<"part_clearance"> | number
    part_name?: StringWithAggregatesFilter<"part_clearance"> | string
    part_picture?: StringNullableWithAggregatesFilter<"part_clearance"> | string | null
    part_color?: StringNullableWithAggregatesFilter<"part_clearance"> | string | null
    part_status?: IntWithAggregatesFilter<"part_clearance"> | number
    users_action?: IntWithAggregatesFilter<"part_clearance"> | number
    created_at?: DateTimeWithAggregatesFilter<"part_clearance"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"part_clearance"> | Date | string
  }

  export type producoptions_clearance_tbWhereInput = {
    AND?: producoptions_clearance_tbWhereInput | producoptions_clearance_tbWhereInput[]
    OR?: producoptions_clearance_tbWhereInput[]
    NOT?: producoptions_clearance_tbWhereInput | producoptions_clearance_tbWhereInput[]
    pot_id?: BigIntFilter<"producoptions_clearance_tb"> | bigint | number
    product_id?: IntFilter<"producoptions_clearance_tb"> | number
    product_option?: StringFilter<"producoptions_clearance_tb"> | string
    create_date?: DateTimeFilter<"producoptions_clearance_tb"> | Date | string
    create_name?: StringFilter<"producoptions_clearance_tb"> | string
    update_date?: DateTimeFilter<"producoptions_clearance_tb"> | Date | string
    update_name?: StringFilter<"producoptions_clearance_tb"> | string
  }

  export type producoptions_clearance_tbOrderByWithRelationInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: producoptions_clearance_tbOrderByRelevanceInput
  }

  export type producoptions_clearance_tbWhereUniqueInput = Prisma.AtLeast<{
    pot_id?: bigint | number
    AND?: producoptions_clearance_tbWhereInput | producoptions_clearance_tbWhereInput[]
    OR?: producoptions_clearance_tbWhereInput[]
    NOT?: producoptions_clearance_tbWhereInput | producoptions_clearance_tbWhereInput[]
    product_id?: IntFilter<"producoptions_clearance_tb"> | number
    product_option?: StringFilter<"producoptions_clearance_tb"> | string
    create_date?: DateTimeFilter<"producoptions_clearance_tb"> | Date | string
    create_name?: StringFilter<"producoptions_clearance_tb"> | string
    update_date?: DateTimeFilter<"producoptions_clearance_tb"> | Date | string
    update_name?: StringFilter<"producoptions_clearance_tb"> | string
  }, "pot_id">

  export type producoptions_clearance_tbOrderByWithAggregationInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: producoptions_clearance_tbCountOrderByAggregateInput
    _avg?: producoptions_clearance_tbAvgOrderByAggregateInput
    _max?: producoptions_clearance_tbMaxOrderByAggregateInput
    _min?: producoptions_clearance_tbMinOrderByAggregateInput
    _sum?: producoptions_clearance_tbSumOrderByAggregateInput
  }

  export type producoptions_clearance_tbScalarWhereWithAggregatesInput = {
    AND?: producoptions_clearance_tbScalarWhereWithAggregatesInput | producoptions_clearance_tbScalarWhereWithAggregatesInput[]
    OR?: producoptions_clearance_tbScalarWhereWithAggregatesInput[]
    NOT?: producoptions_clearance_tbScalarWhereWithAggregatesInput | producoptions_clearance_tbScalarWhereWithAggregatesInput[]
    pot_id?: BigIntWithAggregatesFilter<"producoptions_clearance_tb"> | bigint | number
    product_id?: IntWithAggregatesFilter<"producoptions_clearance_tb"> | number
    product_option?: StringWithAggregatesFilter<"producoptions_clearance_tb"> | string
    create_date?: DateTimeWithAggregatesFilter<"producoptions_clearance_tb"> | Date | string
    create_name?: StringWithAggregatesFilter<"producoptions_clearance_tb"> | string
    update_date?: DateTimeWithAggregatesFilter<"producoptions_clearance_tb"> | Date | string
    update_name?: StringWithAggregatesFilter<"producoptions_clearance_tb"> | string
  }

  export type producoptions_tbWhereInput = {
    AND?: producoptions_tbWhereInput | producoptions_tbWhereInput[]
    OR?: producoptions_tbWhereInput[]
    NOT?: producoptions_tbWhereInput | producoptions_tbWhereInput[]
    pot_id?: BigIntFilter<"producoptions_tb"> | bigint | number
    product_id?: IntFilter<"producoptions_tb"> | number
    product_option?: StringFilter<"producoptions_tb"> | string
    create_date?: DateTimeFilter<"producoptions_tb"> | Date | string
    create_name?: StringFilter<"producoptions_tb"> | string
    update_date?: DateTimeFilter<"producoptions_tb"> | Date | string
    update_name?: StringFilter<"producoptions_tb"> | string
  }

  export type producoptions_tbOrderByWithRelationInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _relevance?: producoptions_tbOrderByRelevanceInput
  }

  export type producoptions_tbWhereUniqueInput = Prisma.AtLeast<{
    pot_id?: bigint | number
    AND?: producoptions_tbWhereInput | producoptions_tbWhereInput[]
    OR?: producoptions_tbWhereInput[]
    NOT?: producoptions_tbWhereInput | producoptions_tbWhereInput[]
    product_id?: IntFilter<"producoptions_tb"> | number
    product_option?: StringFilter<"producoptions_tb"> | string
    create_date?: DateTimeFilter<"producoptions_tb"> | Date | string
    create_name?: StringFilter<"producoptions_tb"> | string
    update_date?: DateTimeFilter<"producoptions_tb"> | Date | string
    update_name?: StringFilter<"producoptions_tb"> | string
  }, "pot_id">

  export type producoptions_tbOrderByWithAggregationInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
    _count?: producoptions_tbCountOrderByAggregateInput
    _avg?: producoptions_tbAvgOrderByAggregateInput
    _max?: producoptions_tbMaxOrderByAggregateInput
    _min?: producoptions_tbMinOrderByAggregateInput
    _sum?: producoptions_tbSumOrderByAggregateInput
  }

  export type producoptions_tbScalarWhereWithAggregatesInput = {
    AND?: producoptions_tbScalarWhereWithAggregatesInput | producoptions_tbScalarWhereWithAggregatesInput[]
    OR?: producoptions_tbScalarWhereWithAggregatesInput[]
    NOT?: producoptions_tbScalarWhereWithAggregatesInput | producoptions_tbScalarWhereWithAggregatesInput[]
    pot_id?: BigIntWithAggregatesFilter<"producoptions_tb"> | bigint | number
    product_id?: IntWithAggregatesFilter<"producoptions_tb"> | number
    product_option?: StringWithAggregatesFilter<"producoptions_tb"> | string
    create_date?: DateTimeWithAggregatesFilter<"producoptions_tb"> | Date | string
    create_name?: StringWithAggregatesFilter<"producoptions_tb"> | string
    update_date?: DateTimeWithAggregatesFilter<"producoptions_tb"> | Date | string
    update_name?: StringWithAggregatesFilter<"producoptions_tb"> | string
  }

  export type product_clearanceWhereInput = {
    AND?: product_clearanceWhereInput | product_clearanceWhereInput[]
    OR?: product_clearanceWhereInput[]
    NOT?: product_clearanceWhereInput | product_clearanceWhereInput[]
    product_id?: IntFilter<"product_clearance"> | number
    category_id?: IntNullableFilter<"product_clearance"> | number | null
    sub_id?: IntNullableFilter<"product_clearance"> | number | null
    part_id?: IntNullableFilter<"product_clearance"> | number | null
    product_name?: StringNullableFilter<"product_clearance"> | string | null
    product_brand?: StringNullableFilter<"product_clearance"> | string | null
    product_description?: StringNullableFilter<"product_clearance"> | string | null
    product_picture?: StringNullableFilter<"product_clearance"> | string | null
    product_sku?: StringNullableFilter<"product_clearance"> | string | null
    product_file?: StringNullableFilter<"product_clearance"> | string | null
    product_filename?: StringNullableFilter<"product_clearance"> | string | null
    product_price?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product_clearance"> | number | null
    product_best?: IntNullableFilter<"product_clearance"> | number | null
    product_status?: IntNullableFilter<"product_clearance"> | number | null
    users_action?: IntNullableFilter<"product_clearance"> | number | null
    created_at?: DateTimeFilter<"product_clearance"> | Date | string
    updated_at?: DateTimeFilter<"product_clearance"> | Date | string
    product_uom?: StringNullableFilter<"product_clearance"> | string | null
    clearanceSales?: BoolNullableFilter<"product_clearance"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product_clearance"> | number | null
    clearancePrice?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product_clearance"> | number | null
    expo_price?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product_clearance"> | number | null
    cat6?: IntNullableFilter<"product_clearance"> | number | null
    tool_tester?: IntNullableFilter<"product_clearance"> | number | null
  }

  export type product_clearanceOrderByWithRelationInput = {
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
    _relevance?: product_clearanceOrderByRelevanceInput
  }

  export type product_clearanceWhereUniqueInput = Prisma.AtLeast<{
    product_id?: number
    AND?: product_clearanceWhereInput | product_clearanceWhereInput[]
    OR?: product_clearanceWhereInput[]
    NOT?: product_clearanceWhereInput | product_clearanceWhereInput[]
    category_id?: IntNullableFilter<"product_clearance"> | number | null
    sub_id?: IntNullableFilter<"product_clearance"> | number | null
    part_id?: IntNullableFilter<"product_clearance"> | number | null
    product_name?: StringNullableFilter<"product_clearance"> | string | null
    product_brand?: StringNullableFilter<"product_clearance"> | string | null
    product_description?: StringNullableFilter<"product_clearance"> | string | null
    product_picture?: StringNullableFilter<"product_clearance"> | string | null
    product_sku?: StringNullableFilter<"product_clearance"> | string | null
    product_file?: StringNullableFilter<"product_clearance"> | string | null
    product_filename?: StringNullableFilter<"product_clearance"> | string | null
    product_price?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product_clearance"> | number | null
    product_best?: IntNullableFilter<"product_clearance"> | number | null
    product_status?: IntNullableFilter<"product_clearance"> | number | null
    users_action?: IntNullableFilter<"product_clearance"> | number | null
    created_at?: DateTimeFilter<"product_clearance"> | Date | string
    updated_at?: DateTimeFilter<"product_clearance"> | Date | string
    product_uom?: StringNullableFilter<"product_clearance"> | string | null
    clearanceSales?: BoolNullableFilter<"product_clearance"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product_clearance"> | number | null
    clearancePrice?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product_clearance"> | number | null
    expo_price?: DecimalNullableFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product_clearance"> | number | null
    cat6?: IntNullableFilter<"product_clearance"> | number | null
    tool_tester?: IntNullableFilter<"product_clearance"> | number | null
  }, "product_id">

  export type product_clearanceOrderByWithAggregationInput = {
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
    _count?: product_clearanceCountOrderByAggregateInput
    _avg?: product_clearanceAvgOrderByAggregateInput
    _max?: product_clearanceMaxOrderByAggregateInput
    _min?: product_clearanceMinOrderByAggregateInput
    _sum?: product_clearanceSumOrderByAggregateInput
  }

  export type product_clearanceScalarWhereWithAggregatesInput = {
    AND?: product_clearanceScalarWhereWithAggregatesInput | product_clearanceScalarWhereWithAggregatesInput[]
    OR?: product_clearanceScalarWhereWithAggregatesInput[]
    NOT?: product_clearanceScalarWhereWithAggregatesInput | product_clearanceScalarWhereWithAggregatesInput[]
    product_id?: IntWithAggregatesFilter<"product_clearance"> | number
    category_id?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    sub_id?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    part_id?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    product_name?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_brand?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_description?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_picture?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_sku?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_file?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_filename?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    product_price?: DecimalNullableWithAggregatesFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    product_best?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    product_status?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    users_action?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"product_clearance"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"product_clearance"> | Date | string
    product_uom?: StringNullableWithAggregatesFilter<"product_clearance"> | string | null
    clearanceSales?: BoolNullableWithAggregatesFilter<"product_clearance"> | boolean | null
    clearanceQuantity?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    clearancePrice?: DecimalNullableWithAggregatesFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    expo_price?: DecimalNullableWithAggregatesFilter<"product_clearance"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    cat6?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
    tool_tester?: IntNullableWithAggregatesFilter<"product_clearance"> | number | null
  }

  export type product_test_uploadWhereInput = {
    AND?: product_test_uploadWhereInput | product_test_uploadWhereInput[]
    OR?: product_test_uploadWhereInput[]
    NOT?: product_test_uploadWhereInput | product_test_uploadWhereInput[]
    product_id?: IntFilter<"product_test_upload"> | number
    category_id?: IntNullableFilter<"product_test_upload"> | number | null
    sub_id?: IntNullableFilter<"product_test_upload"> | number | null
    part_id?: IntNullableFilter<"product_test_upload"> | number | null
    product_name?: StringNullableFilter<"product_test_upload"> | string | null
    product_brand?: StringNullableFilter<"product_test_upload"> | string | null
    product_description?: StringNullableFilter<"product_test_upload"> | string | null
    product_picture?: StringNullableFilter<"product_test_upload"> | string | null
    product_sku?: StringNullableFilter<"product_test_upload"> | string | null
    product_file?: StringNullableFilter<"product_test_upload"> | string | null
    product_filename?: StringNullableFilter<"product_test_upload"> | string | null
    product_price?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product_test_upload"> | number | null
    product_best?: IntNullableFilter<"product_test_upload"> | number | null
    product_status?: IntNullableFilter<"product_test_upload"> | number | null
    users_action?: IntNullableFilter<"product_test_upload"> | number | null
    created_at?: DateTimeFilter<"product_test_upload"> | Date | string
    updated_at?: DateTimeFilter<"product_test_upload"> | Date | string
    product_uom?: StringNullableFilter<"product_test_upload"> | string | null
    clearanceSales?: BoolNullableFilter<"product_test_upload"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product_test_upload"> | number | null
    clearancePrice?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product_test_upload"> | number | null
    expo_price?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product_test_upload"> | number | null
    cat6?: IntNullableFilter<"product_test_upload"> | number | null
    tool_tester?: IntNullableFilter<"product_test_upload"> | number | null
  }

  export type product_test_uploadOrderByWithRelationInput = {
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
    _relevance?: product_test_uploadOrderByRelevanceInput
  }

  export type product_test_uploadWhereUniqueInput = Prisma.AtLeast<{
    product_id?: number
    AND?: product_test_uploadWhereInput | product_test_uploadWhereInput[]
    OR?: product_test_uploadWhereInput[]
    NOT?: product_test_uploadWhereInput | product_test_uploadWhereInput[]
    category_id?: IntNullableFilter<"product_test_upload"> | number | null
    sub_id?: IntNullableFilter<"product_test_upload"> | number | null
    part_id?: IntNullableFilter<"product_test_upload"> | number | null
    product_name?: StringNullableFilter<"product_test_upload"> | string | null
    product_brand?: StringNullableFilter<"product_test_upload"> | string | null
    product_description?: StringNullableFilter<"product_test_upload"> | string | null
    product_picture?: StringNullableFilter<"product_test_upload"> | string | null
    product_sku?: StringNullableFilter<"product_test_upload"> | string | null
    product_file?: StringNullableFilter<"product_test_upload"> | string | null
    product_filename?: StringNullableFilter<"product_test_upload"> | string | null
    product_price?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableFilter<"product_test_upload"> | number | null
    product_best?: IntNullableFilter<"product_test_upload"> | number | null
    product_status?: IntNullableFilter<"product_test_upload"> | number | null
    users_action?: IntNullableFilter<"product_test_upload"> | number | null
    created_at?: DateTimeFilter<"product_test_upload"> | Date | string
    updated_at?: DateTimeFilter<"product_test_upload"> | Date | string
    product_uom?: StringNullableFilter<"product_test_upload"> | string | null
    clearanceSales?: BoolNullableFilter<"product_test_upload"> | boolean | null
    clearanceQuantity?: IntNullableFilter<"product_test_upload"> | number | null
    clearancePrice?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableFilter<"product_test_upload"> | number | null
    expo_price?: DecimalNullableFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableFilter<"product_test_upload"> | number | null
    cat6?: IntNullableFilter<"product_test_upload"> | number | null
    tool_tester?: IntNullableFilter<"product_test_upload"> | number | null
  }, "product_id">

  export type product_test_uploadOrderByWithAggregationInput = {
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
    _count?: product_test_uploadCountOrderByAggregateInput
    _avg?: product_test_uploadAvgOrderByAggregateInput
    _max?: product_test_uploadMaxOrderByAggregateInput
    _min?: product_test_uploadMinOrderByAggregateInput
    _sum?: product_test_uploadSumOrderByAggregateInput
  }

  export type product_test_uploadScalarWhereWithAggregatesInput = {
    AND?: product_test_uploadScalarWhereWithAggregatesInput | product_test_uploadScalarWhereWithAggregatesInput[]
    OR?: product_test_uploadScalarWhereWithAggregatesInput[]
    NOT?: product_test_uploadScalarWhereWithAggregatesInput | product_test_uploadScalarWhereWithAggregatesInput[]
    product_id?: IntWithAggregatesFilter<"product_test_upload"> | number
    category_id?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    sub_id?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    part_id?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    product_name?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_brand?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_description?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_picture?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_sku?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_file?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_filename?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    product_price?: DecimalNullableWithAggregatesFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    product_new?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    product_best?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    product_status?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    users_action?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    created_at?: DateTimeWithAggregatesFilter<"product_test_upload"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"product_test_upload"> | Date | string
    product_uom?: StringNullableWithAggregatesFilter<"product_test_upload"> | string | null
    clearanceSales?: BoolNullableWithAggregatesFilter<"product_test_upload"> | boolean | null
    clearanceQuantity?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    clearancePrice?: DecimalNullableWithAggregatesFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    expo_status?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    expo_price?: DecimalNullableWithAggregatesFilter<"product_test_upload"> | Decimal | DecimalJsLike | number | string | null
    cat5e?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    cat6?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
    tool_tester?: IntNullableWithAggregatesFilter<"product_test_upload"> | number | null
  }

  export type sub_clearanceWhereInput = {
    AND?: sub_clearanceWhereInput | sub_clearanceWhereInput[]
    OR?: sub_clearanceWhereInput[]
    NOT?: sub_clearanceWhereInput | sub_clearanceWhereInput[]
    sub_id?: IntFilter<"sub_clearance"> | number
    category_id?: IntFilter<"sub_clearance"> | number
    sub_name?: StringFilter<"sub_clearance"> | string
    sub_keyword?: StringNullableFilter<"sub_clearance"> | string | null
    sub_title?: StringNullableFilter<"sub_clearance"> | string | null
    sub_description?: StringNullableFilter<"sub_clearance"> | string | null
    sub_picture?: StringNullableFilter<"sub_clearance"> | string | null
    sub_color?: StringNullableFilter<"sub_clearance"> | string | null
    sub_status?: IntFilter<"sub_clearance"> | number
    users_action?: IntFilter<"sub_clearance"> | number
    created_at?: DateTimeFilter<"sub_clearance"> | Date | string
    updated_at?: DateTimeFilter<"sub_clearance"> | Date | string
  }

  export type sub_clearanceOrderByWithRelationInput = {
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
    _relevance?: sub_clearanceOrderByRelevanceInput
  }

  export type sub_clearanceWhereUniqueInput = Prisma.AtLeast<{
    sub_id?: number
    AND?: sub_clearanceWhereInput | sub_clearanceWhereInput[]
    OR?: sub_clearanceWhereInput[]
    NOT?: sub_clearanceWhereInput | sub_clearanceWhereInput[]
    category_id?: IntFilter<"sub_clearance"> | number
    sub_name?: StringFilter<"sub_clearance"> | string
    sub_keyword?: StringNullableFilter<"sub_clearance"> | string | null
    sub_title?: StringNullableFilter<"sub_clearance"> | string | null
    sub_description?: StringNullableFilter<"sub_clearance"> | string | null
    sub_picture?: StringNullableFilter<"sub_clearance"> | string | null
    sub_color?: StringNullableFilter<"sub_clearance"> | string | null
    sub_status?: IntFilter<"sub_clearance"> | number
    users_action?: IntFilter<"sub_clearance"> | number
    created_at?: DateTimeFilter<"sub_clearance"> | Date | string
    updated_at?: DateTimeFilter<"sub_clearance"> | Date | string
  }, "sub_id">

  export type sub_clearanceOrderByWithAggregationInput = {
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
    _count?: sub_clearanceCountOrderByAggregateInput
    _avg?: sub_clearanceAvgOrderByAggregateInput
    _max?: sub_clearanceMaxOrderByAggregateInput
    _min?: sub_clearanceMinOrderByAggregateInput
    _sum?: sub_clearanceSumOrderByAggregateInput
  }

  export type sub_clearanceScalarWhereWithAggregatesInput = {
    AND?: sub_clearanceScalarWhereWithAggregatesInput | sub_clearanceScalarWhereWithAggregatesInput[]
    OR?: sub_clearanceScalarWhereWithAggregatesInput[]
    NOT?: sub_clearanceScalarWhereWithAggregatesInput | sub_clearanceScalarWhereWithAggregatesInput[]
    sub_id?: IntWithAggregatesFilter<"sub_clearance"> | number
    category_id?: IntWithAggregatesFilter<"sub_clearance"> | number
    sub_name?: StringWithAggregatesFilter<"sub_clearance"> | string
    sub_keyword?: StringNullableWithAggregatesFilter<"sub_clearance"> | string | null
    sub_title?: StringNullableWithAggregatesFilter<"sub_clearance"> | string | null
    sub_description?: StringNullableWithAggregatesFilter<"sub_clearance"> | string | null
    sub_picture?: StringNullableWithAggregatesFilter<"sub_clearance"> | string | null
    sub_color?: StringNullableWithAggregatesFilter<"sub_clearance"> | string | null
    sub_status?: IntWithAggregatesFilter<"sub_clearance"> | number
    users_action?: IntWithAggregatesFilter<"sub_clearance"> | number
    created_at?: DateTimeWithAggregatesFilter<"sub_clearance"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"sub_clearance"> | Date | string
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

  export type category_clearanceCreateInput = {
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

  export type category_clearanceUncheckedCreateInput = {
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

  export type category_clearanceUpdateInput = {
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

  export type category_clearanceUncheckedUpdateInput = {
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

  export type category_clearanceCreateManyInput = {
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

  export type category_clearanceUpdateManyMutationInput = {
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

  export type category_clearanceUncheckedUpdateManyInput = {
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

  export type discountpercentage_clearance_tbCreateInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_clearance_tbUncheckedCreateInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_clearance_tbUpdateInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_clearance_tbUncheckedUpdateInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_clearance_tbCreateManyInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_clearance_tbUpdateManyMutationInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_clearance_tbUncheckedUpdateManyInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_tbCreateInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_tbUncheckedCreateInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_tbUpdateInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_tbUncheckedUpdateInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_tbCreateManyInput = {
    dcp_id?: bigint | number
    product_id?: number
    product_discount: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type discountpercentage_tbUpdateManyMutationInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type discountpercentage_tbUncheckedUpdateManyInput = {
    dcp_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_discount?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_clearanceCreateInput = {
    mpc_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_clearanceUncheckedCreateInput = {
    mpc_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_clearanceUpdateInput = {
    mpc_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_clearanceUncheckedUpdateInput = {
    mpc_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_clearanceCreateManyInput = {
    mpc_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_clearanceUpdateManyMutationInput = {
    mpc_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_clearanceUncheckedUpdateManyInput = {
    mpc_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_testCreateInput = {
    mpt_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_testUncheckedCreateInput = {
    mpt_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_testUpdateInput = {
    mpt_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_testUncheckedUpdateInput = {
    mpt_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_testCreateManyInput = {
    mpt_id?: bigint | number
    product_id?: number
    product_picture: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type more_pictures_testUpdateManyMutationInput = {
    mpt_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type more_pictures_testUncheckedUpdateManyInput = {
    mpt_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_picture?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type part_clearanceCreateInput = {
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

  export type part_clearanceUncheckedCreateInput = {
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

  export type part_clearanceUpdateInput = {
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

  export type part_clearanceUncheckedUpdateInput = {
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

  export type part_clearanceCreateManyInput = {
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

  export type part_clearanceUpdateManyMutationInput = {
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

  export type part_clearanceUncheckedUpdateManyInput = {
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

  export type producoptions_clearance_tbCreateInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_clearance_tbUncheckedCreateInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_clearance_tbUpdateInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_clearance_tbUncheckedUpdateInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_clearance_tbCreateManyInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_clearance_tbUpdateManyMutationInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_clearance_tbUncheckedUpdateManyInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_tbCreateInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_tbUncheckedCreateInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_tbUpdateInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_tbUncheckedUpdateInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_tbCreateManyInput = {
    pot_id?: bigint | number
    product_id?: number
    product_option: string
    create_date?: Date | string
    create_name?: string
    update_date?: Date | string
    update_name?: string
  }

  export type producoptions_tbUpdateManyMutationInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type producoptions_tbUncheckedUpdateManyInput = {
    pot_id?: BigIntFieldUpdateOperationsInput | bigint | number
    product_id?: IntFieldUpdateOperationsInput | number
    product_option?: StringFieldUpdateOperationsInput | string
    create_date?: DateTimeFieldUpdateOperationsInput | Date | string
    create_name?: StringFieldUpdateOperationsInput | string
    update_date?: DateTimeFieldUpdateOperationsInput | Date | string
    update_name?: StringFieldUpdateOperationsInput | string
  }

  export type product_clearanceCreateInput = {
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

  export type product_clearanceUncheckedCreateInput = {
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

  export type product_clearanceUpdateInput = {
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

  export type product_clearanceUncheckedUpdateInput = {
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

  export type product_clearanceCreateManyInput = {
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

  export type product_clearanceUpdateManyMutationInput = {
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

  export type product_clearanceUncheckedUpdateManyInput = {
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

  export type product_test_uploadCreateInput = {
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

  export type product_test_uploadUncheckedCreateInput = {
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

  export type product_test_uploadUpdateInput = {
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

  export type product_test_uploadUncheckedUpdateInput = {
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

  export type product_test_uploadCreateManyInput = {
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

  export type product_test_uploadUpdateManyMutationInput = {
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

  export type product_test_uploadUncheckedUpdateManyInput = {
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

  export type sub_clearanceCreateInput = {
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

  export type sub_clearanceUncheckedCreateInput = {
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

  export type sub_clearanceUpdateInput = {
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

  export type sub_clearanceUncheckedUpdateInput = {
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

  export type sub_clearanceCreateManyInput = {
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

  export type sub_clearanceUpdateManyMutationInput = {
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

  export type sub_clearanceUncheckedUpdateManyInput = {
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

  export type category_clearanceOrderByRelevanceInput = {
    fields: category_clearanceOrderByRelevanceFieldEnum | category_clearanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type category_clearanceCountOrderByAggregateInput = {
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

  export type category_clearanceAvgOrderByAggregateInput = {
    category_id?: SortOrder
    category_number?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
  }

  export type category_clearanceMaxOrderByAggregateInput = {
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

  export type category_clearanceMinOrderByAggregateInput = {
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

  export type category_clearanceSumOrderByAggregateInput = {
    category_id?: SortOrder
    category_number?: SortOrder
    category_status?: SortOrder
    users_action?: SortOrder
  }

  export type discountpercentage_clearance_tbOrderByRelevanceInput = {
    fields: discountpercentage_clearance_tbOrderByRelevanceFieldEnum | discountpercentage_clearance_tbOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type discountpercentage_clearance_tbCountOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_clearance_tbAvgOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
  }

  export type discountpercentage_clearance_tbMaxOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_clearance_tbMinOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_clearance_tbSumOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
  }

  export type discountpercentage_tbOrderByRelevanceInput = {
    fields: discountpercentage_tbOrderByRelevanceFieldEnum | discountpercentage_tbOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type discountpercentage_tbCountOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_tbAvgOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
  }

  export type discountpercentage_tbMaxOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_tbMinOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
    product_discount?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type discountpercentage_tbSumOrderByAggregateInput = {
    dcp_id?: SortOrder
    product_id?: SortOrder
  }

  export type more_pictures_clearanceOrderByRelevanceInput = {
    fields: more_pictures_clearanceOrderByRelevanceFieldEnum | more_pictures_clearanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type more_pictures_clearanceCountOrderByAggregateInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_clearanceAvgOrderByAggregateInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
  }

  export type more_pictures_clearanceMaxOrderByAggregateInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_clearanceMinOrderByAggregateInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_clearanceSumOrderByAggregateInput = {
    mpc_id?: SortOrder
    product_id?: SortOrder
  }

  export type more_pictures_testOrderByRelevanceInput = {
    fields: more_pictures_testOrderByRelevanceFieldEnum | more_pictures_testOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type more_pictures_testCountOrderByAggregateInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_testAvgOrderByAggregateInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
  }

  export type more_pictures_testMaxOrderByAggregateInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_testMinOrderByAggregateInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
    product_picture?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type more_pictures_testSumOrderByAggregateInput = {
    mpt_id?: SortOrder
    product_id?: SortOrder
  }

  export type part_clearanceOrderByRelevanceInput = {
    fields: part_clearanceOrderByRelevanceFieldEnum | part_clearanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type part_clearanceCountOrderByAggregateInput = {
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

  export type part_clearanceAvgOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
  }

  export type part_clearanceMaxOrderByAggregateInput = {
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

  export type part_clearanceMinOrderByAggregateInput = {
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

  export type part_clearanceSumOrderByAggregateInput = {
    part_id?: SortOrder
    category_id?: SortOrder
    sub_id?: SortOrder
    part_status?: SortOrder
    users_action?: SortOrder
  }

  export type producoptions_clearance_tbOrderByRelevanceInput = {
    fields: producoptions_clearance_tbOrderByRelevanceFieldEnum | producoptions_clearance_tbOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type producoptions_clearance_tbCountOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_clearance_tbAvgOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
  }

  export type producoptions_clearance_tbMaxOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_clearance_tbMinOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_clearance_tbSumOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
  }

  export type producoptions_tbOrderByRelevanceInput = {
    fields: producoptions_tbOrderByRelevanceFieldEnum | producoptions_tbOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type producoptions_tbCountOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_tbAvgOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
  }

  export type producoptions_tbMaxOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_tbMinOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
    product_option?: SortOrder
    create_date?: SortOrder
    create_name?: SortOrder
    update_date?: SortOrder
    update_name?: SortOrder
  }

  export type producoptions_tbSumOrderByAggregateInput = {
    pot_id?: SortOrder
    product_id?: SortOrder
  }

  export type product_clearanceOrderByRelevanceInput = {
    fields: product_clearanceOrderByRelevanceFieldEnum | product_clearanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type product_clearanceCountOrderByAggregateInput = {
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

  export type product_clearanceAvgOrderByAggregateInput = {
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

  export type product_clearanceMaxOrderByAggregateInput = {
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

  export type product_clearanceMinOrderByAggregateInput = {
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

  export type product_clearanceSumOrderByAggregateInput = {
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

  export type product_test_uploadOrderByRelevanceInput = {
    fields: product_test_uploadOrderByRelevanceFieldEnum | product_test_uploadOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type product_test_uploadCountOrderByAggregateInput = {
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

  export type product_test_uploadAvgOrderByAggregateInput = {
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

  export type product_test_uploadMaxOrderByAggregateInput = {
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

  export type product_test_uploadMinOrderByAggregateInput = {
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

  export type product_test_uploadSumOrderByAggregateInput = {
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

  export type sub_clearanceOrderByRelevanceInput = {
    fields: sub_clearanceOrderByRelevanceFieldEnum | sub_clearanceOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type sub_clearanceCountOrderByAggregateInput = {
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

  export type sub_clearanceAvgOrderByAggregateInput = {
    sub_id?: SortOrder
    category_id?: SortOrder
    sub_status?: SortOrder
    users_action?: SortOrder
  }

  export type sub_clearanceMaxOrderByAggregateInput = {
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

  export type sub_clearanceMinOrderByAggregateInput = {
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

  export type sub_clearanceSumOrderByAggregateInput = {
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