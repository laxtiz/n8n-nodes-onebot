import { AllEntities, Entity, PropertiesOf } from 'n8n-workflow';

export type OneBotMap = {
	bot: 'get_login_info';
	friend: 'get_stranger_info' | 'get_friend_list';
	group: 'get_group_info' | 'get_group_list' | 'get_group_member_info' | 'get_group_member_list';
	message: 'send_group_msg' | 'send_private_msg';
	misc: 'get_status' | 'get_version_info';
};

export type OneBotAction = AllEntities<OneBotMap>;
export type OneBotProperties = PropertiesOf<OneBotAction>;

export type BotAction = Entity<OneBotMap, 'bot'>;
export type BotProperties = PropertiesOf<BotAction>;

export type MessageAction = Entity<OneBotMap, 'message'>;
export type MessageProperties = PropertiesOf<MessageAction>;

export type FriendAction = Entity<OneBotMap, 'friend'>;
export type FriendProperties = PropertiesOf<FriendAction>;

export type GroupAction = Entity<OneBotMap, 'group'>;
export type GroupProperties = PropertiesOf<GroupAction>;

export type MiscAction = Entity<OneBotMap, 'misc'>;
export type MiscProperties = PropertiesOf<MiscAction>;

export interface LoginInfo {
	user_id: number;
	nickname: string;
}
