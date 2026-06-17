export interface MemberInfo {
  userId: string;
  fullName: string;
  imageUrl?: string;
}

export interface BlockContent {
  type: "text";
  text: string;
  styles: Record<string, boolean | string>;
}

export interface Block {
  type: string;
  props?: Record<string, string | number | boolean>;
  content: BlockContent[] | [];
}