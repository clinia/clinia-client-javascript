import { addMethods } from '@clinia/client-common';

import { SearchClient, SearchIndex } from '../..';
import { CreateIndex } from '../../types/CreateIndex';

export const initIndex = (base: SearchClient): CreateIndex => {
  return (indexName, options = {}) => {
    const searchIndex: SearchIndex = {
      transporter: base.transporter,
      engineId: base.engineId,
      indexName,
    };

    return addMethods(searchIndex, options.methods);
  };
};
