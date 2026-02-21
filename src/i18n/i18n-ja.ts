export const ja = {
  // Application
  appTitle: "いよ管",

  // Navigation
  home: "ホーム",
  returnToHome: "ホームに戻る",
  organizations: "組織",
  templates: "テンプレート",
  generators: "AI生成",
  posts: "投稿",
  providers: "プロバイダー",
  users: "ユーザー",
  groups: "グループ",
  settings: "設定",
  appSettings: "アプリの設定",

  // Common UI
  cancel: "キャンセル",
  save: "保存",
  send: "送信",
  close: "閉じる",
  required: "必須",
  active: "有効",
  hardBreak: "Markdown に改行を挿入する",

  // ============================================================================
  // Form Fields
  // ============================================================================
  id: "ID",
  name: "名前",
  title: "タイトル",
  message: "メッセージ",
  link: "リンク",
  feed: "フィード",
  category: "カテゴリ",
  source: "ソース",
  prompt: "プロンプト",
  schedule: "スケジュール",
  presetTimes: "予約時刻",
  image: "画像",
  description: "説明",
  canceled: "キャンセル済み",
  paused: "一時停止",
  scheduled: "予約済み",
  finished: "完了",
  members: "メンバー",
  createdBy: "作成者",
  created: "作成日時",
  updatedBy: "更新者",
  updated: "更新日時",
  untitled: "無題",
  selectImage: "画像を選択",
  removeImage: "画像を削除",
  presetTimesFormat: "1行に1つずつHH:MM形式で入力",

  // Login
  login: "ログイン",
  emailAndPassword: "メールアドレスとパスワード",
  receiveLoginLink: "ログイン用リンクを受信",
  loginWithGoogle: "Googleでログイン",
  loginSuccess: "ログインしました",
  sendLoginLinkSuccess:
    "ログイン用リンクを送信しました。受信トレイをご確認ください。",
  forgotPassword: "パスワードをお忘れですか？",
  email: "メールアドレス",
  password: "パスワード",

  // Password Reset
  resetPassword: "パスワードリセット",
  passwordResetEmailSent:
    "パスワードリセットメールを送信しました。受信トレイをご確認ください。",
  validPassword:
    "10文字以上の大文字・小文字・数字・記号を組み合わせたパスワードを設定してください。",

  // Change Email
  changeEmail: "メールアドレス変更",
  newEmail: "新しいメールアドレス",
  confirmEmail: "メールアドレス確認",
  emailMismatch: "メールアドレスが一致しません",
  enterValidEmail: "有効なメールアドレスを入力してください",

  // Change Password
  changePassword: "パスワード変更",
  newPassword: "新しいパスワード",
  passwordMismatch: "パスワードが一致しません",

  // Home
  selectOrganization: "組織を選択",

  // Organization Management
  addOrganization: "組織を追加",
  addPost: "投稿を追加",
  editPost: "投稿を編集",
  addTemplate: "テンプレートを追加",
  addGenerator: "AI生成を追加",
  addProvider: "プロバイダーを追加",
  addUser: "ユーザーを追加",
  editUser: "ユーザーを編集",

  // Messages
  defaultSuccessMessage: "変更を保存しました",
  defaultErrorMessage: "変更の保存に失敗しました",

  // Validation Errors
  errorInvalidEmail: "メールアドレスの形式が無効です",
  errorEmailMismatch: "メールアドレスが一致しません",
  errorUrlRequired: "URLは必須です",
  errorInvalidUrl: "URLの形式が無効です",
  errorOidReserved: "この組織IDは予約されており使用できません",
  errorOidUsed: "この組織IDは既に使用されています",
  errorOidInvalidFormat: "組織IDは小文字と数字のみ使用できます",
  atLeastOneFieldRequired:
    "タイトル、メッセージ、リンクのいずれか1つは必須です",
  errorPasswordRequired: "パスワードは必須です",
  errorPasswordMin10: "10文字以上が必要です",
  errorPasswordUppercase: "大文字を使用してください",
  errorPasswordLowercase: "小文字を使用してください",
  errorPasswordNumber: "数字を使用してください",
  errorPasswordSymbol: "記号を使用してください",
  errorPasswordMismatch: "パスワードが一致しません",
  errorEmptyText: "タイトル、メッセージ、リンクのいずれか1つは入力してください",
  errorAtLeastOneProvider: "少なくとも1つのプロバイダーを選択してください",
  errorInvalidTimeFormat: "時刻の形式が無効です。HH:MM形式で入力してください",

  // Authentication Errors
  errorLogin: "ログインに失敗しました",
  errorLogout: "ログアウトに失敗しました",
  errorNoUser: "ユーザーがログインしていません",
  errorReauthenticate: "再認証に失敗しました",
  errorResetPassword: "パスワードリセットメールの送信に失敗しました",
  errorSendLoginLink: "ログイン用リンクの送信に失敗しました",
  errorSignInWithGoogle: "Googleサインインに失敗しました",
  errorChangeEmail: "メールアドレスの変更に失敗しました",
  errorChangePassword: "パスワードの変更に失敗しました",
  errorGetUserPrivs: "ユーザー権限の取得に失敗しました",
} as const;
