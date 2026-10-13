/**
 * Formulário de AVALIAÇÃO (CP5).
 *
 *  - Nota (1 a 5) e comentário, com validação ANTES do envio (RF-38).
 *  - Fotos da galeria: sobem em POST /uploads e a avaliação leva os mediaIds (RF-39).
 *  - REGRA DO CP5: toda permissão pode ser negada e o app continua inteiro.
 *    Galeria negada -> o formulário segue funcionando sem foto, e a tela explica
 *    o que foi perdido e como reativar (RF-40).
 */
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StarsInput } from '@/components/Stars';
import { Button } from '@/components/ui';
import { useSubmitReview } from '@/hooks/useReviews';
import { localFileFromAsset } from '@/services/uploads';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import type { LocalFile } from '@/types/reviews';
import { BACKGROUND, COLORS } from '@/styles/style';

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewForm'>;

const MAX_PHOTOS = 5; // limite da API
const MIN_COMMENT = 10; // decisão de produto nossa: comentário com um mínimo de conteúdo

/** Texto próprio para cada regra de negócio que o servidor pode devolver. */
function messageFor(error: ApiError): string {
  if (error.status === 403) return 'Só quem comprou este produto pode avaliá-lo.';
  if (error.status === 409) return 'Você já avaliou este produto.';
  return error.message;
}

export function ReviewFormScreen({ route, navigation }: Props) {
  const { productId, productName } = route.params;
  const submit = useSubmitReview(productId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<LocalFile[]>([]);
  const [attempted, setAttempted] = useState(false);
  // null = a galeria não foi negada. Objeto = foi negada (e se dá para pedir de novo).
  const [galleryDenied, setGalleryDenied] = useState<{ canAskAgain: boolean } | null>(null);

  const ratingError = rating < 1 ? 'Escolha uma nota de 1 a 5.' : null;
  const commentError =
    comment.trim().length < MIN_COMMENT ? `Conte um pouco mais (mínimo de ${MIN_COMMENT} caracteres).` : null;

  async function pickPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      // Não é erro e não trava nada: só registra o estado e explica na tela.
      setGalleryDenied({ canAskAgain: permission.canAskAgain });
      return;
    }
    setGalleryDenied(null);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
      quality: 0.7,
    });
    if (result.canceled) return;

    setPhotos((current) => {
      const known = new Set(current.map((photo) => photo.uri));
      const added = result.assets.filter((asset) => !known.has(asset.uri)).map(localFileFromAsset);
      return [...current, ...added].slice(0, MAX_PHOTOS);
    });
  }

  function handleSubmit() {
    setAttempted(true);
    if (ratingError || commentError) return;
    submit.mutate({ rating, comment, photos }, { onSuccess: () => navigation.goBack() });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.product} numberOfLines={2}>
          {productName}
        </Text>

        <View style={styles.block}>
          <Text style={styles.label}>Sua nota</Text>
          <StarsInput value={rating} onChange={setRating} disabled={submit.isPending} />
          {attempted && ratingError && <Text style={styles.error}>{ratingError}</Text>}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Seu comentário</Text>
          <TextInput
            style={styles.textarea}
            placeholder="O que você achou do produto?"
            placeholderTextColor={COLORS.gray}
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
            editable={!submit.isPending}
          />
          {attempted && commentError && <Text style={styles.error}>{commentError}</Text>}
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>
            Fotos ({photos.length}/{MAX_PHOTOS}) — opcional
          </Text>

          {photos.length > 0 && (
            <View style={styles.photos}>
              {photos.map((photo) => (
                <View key={photo.uri}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <Pressable
                    style={styles.remove}
                    onPress={() => setPhotos((current) => current.filter((p) => p.uri !== photo.uri))}
                    accessibilityLabel="Remover foto"
                    disabled={submit.isPending}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {photos.length < MAX_PHOTOS && (
            <Button label="Adicionar foto da galeria" variant="ghost" onPress={pickPhotos} disabled={submit.isPending} />
          )}

          {galleryDenied && (
            <View style={styles.denied}>
              <Text style={styles.deniedTitle}>Sem acesso à galeria</Text>
              <Text style={styles.deniedText}>
                Você pode enviar a avaliação normalmente, só não será possível anexar fotos.
                {galleryDenied.canAskAgain
                  ? ' Se mudar de ideia, toque em "Adicionar foto" para permitir.'
                  : ' Para anexar fotos, ative a permissão de fotos nas configurações do aparelho.'}
              </Text>
              {!galleryDenied.canAskAgain && (
                <Button label="Abrir configurações" variant="ghost" onPress={() => Linking.openSettings()} />
              )}
            </View>
          )}
        </View>

        {submit.isError && <Text style={styles.error}>{messageFor(submit.error as ApiError)}</Text>}

        <Button
          label={submit.isPending ? 'Enviando…' : 'Enviar avaliação'}
          onPress={handleSubmit}
          disabled={submit.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BACKGROUND.backgorundMain },
  container: { padding: 16, gap: 16 },
  product: { fontSize: 18, fontWeight: '800', color: COLORS.black },
  block: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.black },
  textarea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photo: { width: 80, height: 80, borderRadius: 12, backgroundColor: COLORS.background },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  denied: { backgroundColor: '#fffbeb', borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: '#fde68a' },
  deniedTitle: { fontSize: 13, fontWeight: '800', color: '#92400e' },
  deniedText: { fontSize: 13, color: '#92400e', lineHeight: 19 },
  error: { fontSize: 13, color: '#b91c1c' },
});
