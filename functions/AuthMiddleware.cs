using Microsoft.AspNetCore.Authentication;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;

namespace everything_timeline;

/// <summary>
/// Functions worker middleware that triggers JWT Bearer validation on every request
/// and populates HttpContext.User so functions can read claims via req.HttpContext.User.
/// </summary>
public class AuthMiddleware : IFunctionsWorkerMiddleware
{
    public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
    {
        var httpContext = context.GetHttpContext();
        if (httpContext is not null)
        {
            // Attempt to authenticate — validates the Bearer token if present and
            // populates HttpContext.User with claims. Non-authenticated requests
            // are allowed through; individual functions decide whether to enforce auth.
            var result = await httpContext.AuthenticateAsync();
            if (result.Succeeded)
            {
                httpContext.User = result.Principal;
            }
        }

        await next(context);
    }
}
