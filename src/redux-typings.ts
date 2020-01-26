export interface ResourceState {
  items: Entity[];
  isCreating: boolean,
  isReadingBlindly: boolean,
  reading: Identifier[];
  updating: Identifier[];
  deleting: Identifier[];
  finishingLogs: Message[],
  currentMessage?: Message;
}

export interface ResourceAction<T extends string> {
  type: T;
  payload: ResourceIntent;
}

export interface ResourceIntent {
  operation: Operation;
  step: Step;
  identifying?: Identifier | Identifier[];
  content?: Entity | Entity[] | Error;
}

export type Step = (
  | 'DOING'
  | 'SUCCESS'
  | 'ERROR'
);

export type Operation = (
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'CLEAR_ITEMS'
  | 'CLEAR_CURRENT_MESSAGE'
);

export interface Message {
  text: string;
  isError: boolean;
  causedByError?: Error | null,
};

export interface Entity {
  [key: string]: any;
}

export type IdentifierKey = string;

export type Identifier = string | number;

export interface Gateway {
  readOne?: (identifying?: Identifier, ...args: any[]) => Promise<Entity>;
  readMany?: (identifying?: Identifier[], ...args: any[]) => Promise<Entity[]>;
}
