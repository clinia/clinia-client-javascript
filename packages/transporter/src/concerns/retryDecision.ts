import { Response } from '@clinia/requester-common';

const isNetworkError = ({ isTimedOut, status }: Response): boolean => {
  return !isTimedOut && ~~status === 0;
};

const isRetryable = (response: Response): boolean => {
  const status = response.status;
  const isTimedOut = response.isTimedOut;

  return (
    isTimedOut || isNetworkError(response) || (~~(status / 100) !== 2 && ~~(status / 100) !== 4)
  );
};

const isSuccess = ({ status }: Response): boolean => {
  return ~~(status / 100) === 2;
};

export const retryDecision = <TResponse>(
  response: Response,
  outcomes: Outcomes<TResponse>
): Readonly<Promise<TResponse>> => {
  if (isRetryable(response)) {
    return outcomes.onRetry(response);
  }

  if (isSuccess(response)) {
    return outcomes.onSucess(response);
  }

  return outcomes.onFail(response);
};

export type Outcomes<TResponse> = {
  readonly onFail: (response: Response) => Readonly<Promise<never>>;
  readonly onSucess: (response: Response) => Readonly<Promise<TResponse>>;
  readonly onRetry: (response: Response) => Readonly<Promise<TResponse>>;
};
