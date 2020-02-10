import { Destroyable } from '@clinia/requester-common';
import { Transporter } from '@clinia/transporter';

export const destroy = (base: { readonly transporter: Transporter }) => {
  return (): Readonly<Promise<void>> => {
    return ((base.transporter.requester as unknown) as Destroyable).destroy();
  };
};
