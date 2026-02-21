import ProviderIcons from "./ProviderIcons";
import { type Provider } from "../types/Provider";
import { type Post } from "../types/Post";

export default function PostProvidersState({
  providers,
  post,
  withName = false,
}: {
  providers: Provider[];
  post: Post;
  withName?: boolean;
}) {
  const isDisabled = (providerId: string) =>
    !post.providers.includes(providerId);
  const isError = (providerId: string) =>
    post.errors?.some((e) => e.provider === providerId) ?? false;
  const classes = (provider: Provider) =>
    ["post-providers-state"]
      .concat(isDisabled(provider.id) ? ["disabled"] : [])
      .concat(isError(provider.id) ? ["error"] : [])
      .join(" ");

  return (
    <>
      {providers?.map((provider) => (
        <span className={classes(provider)} key={provider.id}>
          <ProviderIcons
            key={provider.id}
            type={provider.type}
            disabled={isDisabled(provider.id)}
            error={isError(provider.id)}
          />
          {withName && provider.name}
        </span>
      ))}
    </>
  );
}
