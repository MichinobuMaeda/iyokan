export const ja = {
  // Common UI
  cancel: "キャンセル",
  save: "保存",
  send: "送信",
  close: "閉じる",
  required: "必須",
  hardBreak: "Markdown に改行を挿入する",
  defaultSuccessMessage: "変更を保存しました",
  defaultErrorMessage: "変更の保存に失敗しました",

  // App header and navigation
  appTitle: "いよかん",
  home: "ホーム",
  returnToHome: "ホームに戻る",
  organizations: "組織",
  providers: "プロバイダー",
  users: "ユーザー",
  groups: "グループ",
  appSettings: "アプリの設定",
  changeEmail: "メールアドレス変更",
  changePassword: "パスワード変更",

  // Common form fields
  name: "名前",
  email: "メールアドレス",
  password: "パスワード",
  newEmail: "新しいメールアドレス",
  confirmEmail: "メールアドレス確認",
  newPassword: "新しいパスワード",
  description: "説明",
  active: "有効",

  // Meta information
  id: "ID",
  created: "作成日時",
  updated: "更新日時",
  members: "メンバー",

  // Login page
  loginTitle: "ログイン",
  loginSuccess: "ログインしました",
  forgotPassword: "パスワードをお忘れですか？",

  // Reset password page
  resetPasswordTitle: "パスワードリセット",
  passwordResetEmailSent:
    "パスワードリセットメールを送信しました。受信トレイをご確認ください。",
  validPassword:
    "10文字以上の大文字・小文字・数字・記号を組み合わせたパスワードを設定してください。",

  // Change email page
  emailMismatch: "メールアドレスが一致しません",
  enterValidEmail: "有効なメールアドレスを入力してください",

  // Change password page
  passwordMismatch: "パスワードが一致しません",

  // Home page
  selectOrganization: "組織を選択",

  // Actions
  addOrganization: "組織を追加",
  addProvider: "プロバイダーを追加",
  addUser: "ユーザーを追加",
  editUser: "ユーザーを編集",

  // Validation errors
  errorInvalidEmail: "メールアドレスの形式が無効です",
  errorUrlRequired: "URLは必須です",
  errorInvalidUrl: "URLの形式が無効です",
  errorOrgIdReserved: "この組織IDは予約されており使用できません",
  errorOrgIdUsed: "この組織IDは既に使用されています",
  errorOidInvalidFormat: "組織IDは小文字と数字のみ使用できます",
  errorPasswordRequired: "パスワードは必須です",
  errorPasswordMin10: "10文字以上が必要です",
  errorPasswordUppercase: "大文字を使用してください",
  errorPasswordLowercase: "小文字を使用してください",
  errorPasswordNumber: "数字を使用してください",
  errorPasswordSymbol: "記号を使用してください",
  errorPasswordMismatch: "パスワードが一致しません",
  errorEmailMismatch: "メールアドレスが一致しません",

  // Authentication errors
  errorLogin: "ログインに失敗しました",
  errorResetPassword: "パスワードリセットメールの送信に失敗しました",
  errorLogout: "ログアウトに失敗しました",
  errorNoUser: "ユーザーがログインしていません",
  errorReauthenticate: "再認証に失敗しました",
  errorChangeEmail: "メールアドレスの変更に失敗しました",
  errorChangePassword: "パスワードの変更に失敗しました",
  errorGetUserPrivs: "ユーザー権限の取得に失敗しました",
} as const;
