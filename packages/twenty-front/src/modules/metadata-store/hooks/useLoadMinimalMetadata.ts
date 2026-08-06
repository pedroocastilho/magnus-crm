import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

// Rotulos padrao sao traduzidos pelo servidor conforme o locale do membro; o hash
// das colecoes nao muda com o idioma, entao registramos o locale usado na carga
// para invalidar o cache quando o usuario troca de idioma.
const METADATA_STORE_LOCALE_KEY = 'metadataStoreLoadedLocale';

export const useLoadMinimalMetadata = () => {
  const client = useApolloClient();
  const store = useStore();

  const loadMinimalMetadata = useCallback(async () => {
    const result = await client.query<FindMinimalMetadataQuery>({
      query: FIND_MINIMAL_METADATA,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.minimalMetadata)) {
      return null;
    }

    const { objectMetadataItems, views, collectionHashes } =
      result.data.minimalMetadata;

    const currentLocale =
      store.get(currentWorkspaceMemberState.atom)?.locale ?? SOURCE_LOCALE;
    const localeChanged =
      window.localStorage.getItem(METADATA_STORE_LOCALE_KEY) !== currentLocale;

    const staleEntityKeys: MetadataEntityKey[] = [];

    const entityKeysWithServerHash = new Set<MetadataEntityKey>();

    if (isDefined(collectionHashes)) {
      for (const { collectionName, hash } of collectionHashes) {
        const entityKey = mapAllMetadataNameToEntityKey(collectionName);

        if (!isDefined(entityKey)) {
          continue;
        }

        entityKeysWithServerHash.add(entityKey);

        const entry = store.get(metadataStoreState.atomFamily(entityKey));

        if (entry.currentCollectionHash !== hash || localeChanged) {
          staleEntityKeys.push(entityKey);
        }

        store.set(metadataStoreState.atomFamily(entityKey), (prev) => ({
          ...prev,
          draftCollectionHash: hash,
        }));
      }
    }

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (
        !entityKeysWithServerHash.has(entityKey) &&
        !staleEntityKeys.includes(entityKey)
      ) {
        staleEntityKeys.push(entityKey);
      }
    }

    const objectsEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    if (objectsEntry.status === 'empty' || localeChanged) {
      store.set(
        metadataStoreState.atomFamily('objectMetadataItems'),
        (prev) => ({
          ...prev,
          current: objectMetadataItems as unknown as FlatObjectMetadataItem[],
          status: 'up-to-date',
          currentCollectionHash: prev.draftCollectionHash,
          draftCollectionHash: undefined,
        }),
      );
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (viewsEntry.status === 'empty' || localeChanged) {
      store.set(metadataStoreState.atomFamily('views'), (prev) => ({
        ...prev,
        current: views as unknown as FlatView[],
        status: 'up-to-date',
        currentCollectionHash: prev.draftCollectionHash,
        draftCollectionHash: undefined,
      }));
    }

    window.localStorage.setItem(METADATA_STORE_LOCALE_KEY, currentLocale);

    return { staleEntityKeys };
  }, [client, store]);

  return { loadMinimalMetadata };
};
