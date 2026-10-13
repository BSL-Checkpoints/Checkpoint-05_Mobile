/**
 * Serviço de UPLOAD (CP5).
 */
import { http } from './http';
import type { LocalFile, UploadedMedia } from '@/types/reviews';

/** Envia UMA imagem. O `id` da resposta é o que vai depois na avaliação (não a url). */
export async function uploadImage(file: LocalFile, folder = 'avaliacoes'): Promise<UploadedMedia> {
  const form = new FormData();

  // Cast justificado: a tipagem do FormData foi escrita para o navegador (Blob).
  // No React Native o formato correto é { uri, name, type }.
  form.append('file', file as unknown as Blob);
  form.append('folder', folder);

  const { data } = await http.post<UploadedMedia>('/uploads', form, {
    // `undefined` REMOVE o padrão application/json sem fixar nada na mão.
    // (Cast justificado: o tipo do Axios não aceita undefined aqui, mas o runtime sim.)
    headers: { 'Content-Type': undefined as unknown as string },
    // Foto de celular é pesada: o timeout padrão (15 s) derrubaria envios legítimos.
    timeout: 60000,
  });
  return data;
}

/** Nome e tipo a partir da uri do ImagePicker (".../IMG_0042.jpg"). */
export function localFileFromAsset(asset: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}): LocalFile {
  const name = asset.fileName ?? asset.uri.split('/').pop() ?? `foto-${Date.now()}.jpg`;
  const extension = name.split('.').pop()?.toLowerCase();
  const type = asset.mimeType ?? (extension === 'png' ? 'image/png' : 'image/jpeg');
  return { uri: asset.uri, name, type };
}
