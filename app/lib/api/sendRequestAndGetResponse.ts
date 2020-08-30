import 'isomorphic-unfetch';
import { makeQueryString } from './makeQueryString';

export default async function sendRequestAndGetResponse(path: string, opts: any = {}) {
  const headers = Object.assign(
    {},
    opts.headers || {},
    opts.externalServer
      ? {}
      : {
          'Content-type': 'application/json; charset=UTF-8',
        },
  );

  const { request } = opts;
  if (request && request.headers && request.headers.cookie) {
    headers.cookie = request.headers.cookie;
  }

  const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

  const fullUrl = opts.externalServer ? `${path}${qs}` : `${process.env.URL_API}${path}${qs}`;

  console.log(`send request: ${fullUrl}`);
  const response = await fetch(
    fullUrl,
    Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
  );

  const text = await response.text();

  if (response.status >= 400) {
    console.log(`Response status >=400 to ${path}`);
    throw new Error(response.status.toString());
  }

  try {
    const data = JSON.parse(text);

    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return text;
    }

    console.log(`Error while sendRequest to ${path}: ${err}`);
    throw err;
  }
}
