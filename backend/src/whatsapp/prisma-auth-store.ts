import {
  AuthenticationCreds,
  AuthenticationState,
  BufferJSON,
  SignalDataTypeMap,
  initAuthCreds,
  proto,
} from '@whiskeysockets/baileys';
import { PrismaClient } from '@prisma/client';

/**
 * Custom Prisma PostgeSQL Auth State for Baileys.
 * This completely eliminates the need for `useMultiFileAuthState` (which uses the local disk),
 * making the WhatsApp integration 100% self-sufficient and stateless at the backend layer.
 */
export const usePrismaAuthState = async (
  prisma: PrismaClient,
  instanceId: string,
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  const writeData = async (type: string, keyId: string, data: any) => {
    const jsonString = JSON.stringify(data, BufferJSON.replacer);
    await prisma.whatsAppAuthState.upsert({
      where: {
        instanceId_type_keyId: {
          instanceId,
          type,
          keyId,
        },
      },
      update: { data: jsonString },
      create: {
        instanceId,
        type,
        keyId,
        data: jsonString,
      },
    });
  };

  const readData = async (type: string, keyId: string) => {
    const result = await prisma.whatsAppAuthState.findUnique({
      where: {
        instanceId_type_keyId: {
          instanceId,
          type,
          keyId,
        },
      },
    });

    if (result && result.data) {
      return JSON.parse(result.data, BufferJSON.reviver);
    }
    return null;
  };

  const removeData = async (type: string, keyId: string) => {
    try {
      await prisma.whatsAppAuthState.delete({
        where: {
          instanceId_type_keyId: {
            instanceId,
            type,
            keyId,
          },
        },
      });
    } catch (e) {
      // Ignore record not found
    }
  };

  const credsData = await readData('creds', 'root');
  const creds: AuthenticationCreds = credsData || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [_: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(type, id);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value as SignalDataTypeMap[typeof type];
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const category in data) {
            const keys = data[category as keyof typeof data];
            if (!keys) continue;
            for (const id in keys) {
              const value = keys[id as keyof typeof keys];
              if (value) {
                tasks.push(writeData(category, id, value));
              } else {
                tasks.push(removeData(category, id));
              }
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => {
      return writeData('creds', 'root', creds);
    },
  };
};
