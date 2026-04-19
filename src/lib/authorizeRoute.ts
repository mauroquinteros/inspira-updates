import { NextRequest, NextResponse } from "next/server";
import type { AppUser } from "@/db/users";
import { requireAppUser } from "@/lib/currentUser";

type AuthorizeRouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
};

type AuthorizeRouteHandler<TParams extends Record<string, string> = Record<string, string>> = (
  args: {
    request: NextRequest;
    user: AppUser;
    params: Promise<TParams>;
  }
) => Promise<Response>;

type AuthorizeRouteOptions = {
  logLabel?: string;
  onError?: (error: unknown) => Response;
};

export function authorizeRoute<TParams extends Record<string, string> = Record<string, string>>(
  handler: AuthorizeRouteHandler<TParams>,
  options: AuthorizeRouteOptions = {}
) {
  return async (
    request: NextRequest,
    context?: AuthorizeRouteContext<TParams>
  ): Promise<Response> => {
    try {
      const user = await requireAppUser(request);
      return await handler({
        request,
        user,
        params: context?.params ?? Promise.resolve({} as TParams),
      });
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      if (options.onError) {
        return options.onError(error);
      }

      if (options.logLabel) {
        console.error(options.logLabel, error);
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
