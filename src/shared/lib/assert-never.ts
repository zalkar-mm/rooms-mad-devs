/**
 * Проверка полноты `switch` по дискриминанту (docs/code-style.md §1): новый вариант без ветки — ошибка
 * компилятора здесь, а во время выполнения — исключение вместо молчаливого `undefined`.
 */
export function assertNever(value: never): never {
  throw new Error(`Неизвестный вариант: ${JSON.stringify(value)}`);
}
