import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import {
  dedupExchange,
  fetchExchange,
  Exchange,
  stringifyVariables,
} from "urql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import betterUpdateQuery from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";
// import { gql } from "@urql/core";
import { isServer } from "./isServer";

//allow us to catch all errors, so we can handle all errors at globle level
const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

//pagination
export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }
    // read data from cache
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(entityKey, fieldKey);
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };

    //   const visited = new Set();
    //   let result: NullArray<string> = [];
    //   let prevOffset: number | null = null;

    //   for (let i = 0; i < size; i++) {
    //     const { fieldKey, arguments: args } = fieldInfos[i];
    //     if (args === null || !compareArgs(fieldArgs, args)) {
    //       continue;
    //     }

    //     const links = cache.resolve(entityKey, fieldKey) as string[];
    //     const currentOffset = args[cursorArgument];

    //     if (
    //       links === null ||
    //       links.length === 0 ||
    //       typeof currentOffset !== 'number'
    //     ) {
    //       continue;
    //     }

    //     const tempResult: NullArray<string> = [];

    //     for (let j = 0; j < links.length; j++) {
    //       const link = links[j];
    //       if (visited.has(link)) continue;
    //       tempResult.push(link);
    //       visited.add(link);
    //     }

    //     if (
    //       (!prevOffset || currentOffset > prevOffset) ===
    //       (mergeMode === 'after')
    //     ) {
    //       result = [...result, ...tempResult];
    //     } else {
    //       result = [...tempResult, ...result];
    //     }

    //     prevOffset = currentOffset;
    //   }

    //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    //   if (hasCurrentPage) {
    //     return result;
    //   } else if (!(info as any).store.schema) {
    //     return undefined;
    //   } else {
    //     info.partial = true;
    //     return result;
    //   }
  };
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  } // ssr: browser->nextjs->server.  Client side render: browser->server
  //the above bind cookie to header for ssr.

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            vote: (_result, args, cache, info) => {
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });
              // const { postId, value } = args as VoteMutationVariables;

              // below method not work properly, but worth trying
              // const data = cache.readFragment(
              //   gql`
              //     fragment _ on Post {
              //       id
              //       points
              //       voteStatus {
              //         value
              //       }
              //     }
              //   `,
              //   { id: postId }
              // ); // Data or null
              // if (data) {
              //   if (data.voteStatus && data.voteStatus.value === value) {
              //     return;
              //   }
              //   if (data.voteStatus) {
              //     const newPoint =
              //       (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
              //     cache.writeFragment(
              //       gql`
              //         fragment __ on Post {
              //           points
              //           voteStatus {
              //             value
              //           }
              //         }
              //       `,
              //       {
              //         id: postId,
              //         points: newPoint,
              //         voteStatus: {
              //           value,
              //         },
              //       }
              //     );
              //   } else {
              //     const newPoint =
              //       (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
              //     cache.writeFragment(
              //       gql`
              //         fragment __ on Post {
              //           points
              //           voteStatus {
              //             value
              //           }
              //         }
              //       `,
              //       { id: postId, points: newPoint }
              //     );
              //   }
              // }
            },
            createPost: (_result, args, cache, info) => {
              //option2: invalidate each post's cache
              const allFields = cache.inspectFields("Query");
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === "posts"
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate("Query", "posts", fi.arguments || {});
              });

              //option1: invalidate a perticular query, so the page will refetch data from server
              // cache.invalidate("Query", "posts", {
              //   limit: 15,
              // });
            },
            logout: (_result, args, cache, info) => {
              //just null user , not invalidate user, not wipe cache
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => {
                  return { me: null };
                }
              );
            },

            login: (_result, args, cache, info) => {
              // cache.updateQuery({query:MeDocument}, (data:MeQuery)=>{})
              // immer is used
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
            },

            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
