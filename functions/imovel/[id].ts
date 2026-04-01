export const onRequest: PagesFunction = async (context) => {
  const response = await context.env.ASSETS.fetch(context.request);
  if (response.status !== 404) return response;

  const url = new URL(context.request.url);
  url.pathname = "/imovel/_";
  return context.env.ASSETS.fetch(new Request(url, context.request));
};
