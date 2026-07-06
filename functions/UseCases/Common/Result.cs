using System.Net;

namespace everything_timeline.UseCases.Common;

public class Result
{
    public Result() { }

    protected Result(bool success)
    {
        this.Success = success;
        this.Error = Problem.None;
    }

    protected Result(bool success, Problem problem)
    {
        if (success && problem != Problem.None || !success && problem == Problem.None)
        {
            throw new ArgumentException("Invalid error", nameof(problem));
        }

        this.Success = success;
        this.Error = problem;
    }

    public bool Success { get; init; }

    public bool IsFailure => !this.Success;

    public Problem Error { get; init; } = Problem.None;

    public static Result Ok() => new(true, Problem.None);

    public static Result<T> Ok<T>(T data) => Result<T>.Ok(data);

    public static Result Failure(Problem error) => new(false, error);

    public static Result<T> Failure<T>(Problem error) => Result<T>.Failure(error);
}

public sealed record Problem(HttpStatusCode ErrorCode, string Description)
{
    public static readonly Problem None = new(HttpStatusCode.OK, string.Empty);
}

public class Result<T> : Result
{
    public Result() { }

    private Result(bool success, T? data) : base(success)
    {
        this.Data = data;
    }

    private Result(Problem error) : base(false, error)
    {
        this.Data = default;
    }

    public T? Data { get; init; }

    public static Result<T> Ok(T data) => new(true, data);

    public static new Result<T> Failure(Problem error) => new(error);
}