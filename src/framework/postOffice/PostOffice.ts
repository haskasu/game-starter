import { Framework } from "../Framework";
import { ArrayUtil } from "../utils/ArrayUtil";

export class Message {
  private _type: string;

  private _date: Object = {};

  constructor(_type: string, _data: Object) {
    this._type = _type;
    this._date = _data || {};
  }

  public get type(): string {
    return this._type;
  }

  public get data(): Object {
    return this._date;
  }
}

export class PostPackage {
  private _senderId: string;

  private _topic: string;

  private _message: Message;

  private _valid: boolean;

  constructor(senderId: string, topic: string, message: Message) {
    this.reset(senderId, topic, message);
  }

  reset(senderId: string, topic: string, message: Message): PostPackage {
    this._senderId = senderId;
    this._topic = topic;
    this._message = message;
    this._valid = true;
    return this;
  }

  public get senderId(): string {
    return this._senderId;
  }

  public get topic(): string {
    return this._topic;
  }

  public get message(): Message {
    return this._message;
  }

  public get valid(): boolean {
    return this._valid;
  }

  public invalid() {
    this._valid = false;
  }
}

export class PostClient {
  private _topic: string;

  private _onReceivePost: Function;

  private _onReceivePostOwner;

  private _office: PostOffice;

  constructor(myTopicId: string, office: PostOffice) {
    this._topic = myTopicId;
    this._office = office;

    if (this._topic) {
      this.subscribe(this._topic);
    }
  }

  public setReceivePostFunction(owner, func: Function) {
    this._onReceivePost = func;
    this._onReceivePostOwner = owner;
  }

  public get topicId(): string {
    return this._topic;
  }

  _receivePost(post: PostPackage) {
    if (this._onReceivePost) {
      if (this._onReceivePostOwner) {
        this._onReceivePost.call(this._onReceivePostOwner, post);
      } else {
        this._onReceivePost(post);
      }
    }
  }

  public subscribe(topic: string) {
    this._office.subscribe(topic, this);
  }

  public unsubscribe(topic: string) {
    this._office.unsubscribe(topic, this);
  }

  public sendMessage(topic: string, message: Message, delayMs: number = 0) {
    this._office.sendMessage(this._topic, topic, message, delayMs);
  }

  public dispose() {
    this._office.disposeClient(this);
    this._onReceivePost = null;
    this._onReceivePostOwner = null;
  }
}

export class PostOffice {
  private _topicClientsMap = {};

  private _postPool: Array<PostPackage> = new Array<PostPackage>();

  private _fw: Framework;

  constructor(fw: Framework) {
    this._fw = fw;
  }

  public createClient(clientId: string = null): PostClient {
    return new PostClient(clientId, this);
  }

  disposeClient(client: PostClient) {
    for (let topic in this._topicClientsMap) {
      let clients = this._topicClientsMap[topic];
      if (ArrayUtil.removeElement(clients, client) && clients.length == 0) {
        delete this._topicClientsMap[topic];
      }
    }
  }

  public subscribe(topic: string, client: PostClient) {
    var clients = this._topicClientsMap[topic];
    if (clients == null) {
      clients = this._topicClientsMap[topic] = [];
    }
    ArrayUtil.addUniqueElement(clients, client);
  }

  public unsubscribe(topic: string, client: PostClient) {
    var clients = this._topicClientsMap[topic];
    if (clients) {
      ArrayUtil.removeElement(clients, client);
    }
  }

  public sendMessage(senderId: string, topic: string, message: Message = null, delayMs: number = 0) {
    if (delayMs > 0) {
      this._fw.addDelayFunction(this, this.sendPost, [this.getPost(senderId, topic, message)], delayMs);
    }
    var clients = this._topicClientsMap[topic];
    if (clients) {
      var post: PostPackage = this.getPost(senderId, topic, message);
      for (let client of clients.slice()) {
        client._receivePost(post);
        if (!post.valid)
          break;
      }
      this.recyclePost(post);
    }
  }

  private sendPost(post: PostPackage) {
    var clients = this._topicClientsMap[post.topic]
    if (clients) {
      for (let client of clients.slice()) {
        if (post.valid) {
          client._receivePost(post)
        } else {
          break
        }
      }
    }
    this.recyclePost(post)
  }

  private recyclePost(post: PostPackage) {
    this._postPool.push(post)
  }

  private getPost(
    senderId: string,
    topic: string,
    message: Message
  ): PostPackage {
    if (this._postPool.length) {
      return this._postPool.pop().reset(senderId, topic, message)
    }
    return new PostPackage(senderId, topic, message)
  }
}
