import * as express from 'express';
import { ILoggerInstance, IMessageEvent, IMessageStatusEvent, ISubscription, Channel, MessageSubscription, MessageStatusSubscription, MessageDirection } from '../types';
import { Logger } from '../utils/logger';
import { EventEmitter } from 'events';
import { Client } from './client';
import { createServer, Server } from 'http';

const HTTP_CONFLICT_ERROR = 409;

type MessageEventCallback = (event: IMessageEvent) => void;
type MessageStatusEventCallback = (event: IMessageStatusEvent) => void;

/**
 * Webhook configuration options.
 */
export interface IWebhookOptions {
  /**
   * Port. The default port is `3000`.
   */
  port?: number;
  /**
   * Path. The default path is `/`.
   */
  path?: string;
  /**
   * Callback to receive a message event.
   */
  messageEventHandler?: MessageEventCallback;
  /**
   * Callback to receive a message status event.
   */
  messageStatusEventHandler?: MessageStatusEventCallback;
  /**
   * Client to create a subscription.
   */
  client?: Client;
  /**
   * URL to create a subscription.
   */
  url?: string;
  /**
   * Channel to create a subscription.
   */
  channel?: Channel;
  /**
   * Message direction to create a subscription.
   */
  direction?: MessageDirection;
  /**
   * Log instance.
   */
  loggerInstance?: ILoggerInstance;
}

export class WebhookController extends EventEmitter {

  options: IWebhookOptions;
  protected logger: Logger;
  server: Server;
  app: express.Application = express();

  constructor(options: IWebhookOptions) {
    super();

    this.options = options;

    this.logger = new Logger(options.loggerInstance);
  }

  public async init(): Promise<void> {
    this.startServer();

    try {
      await this.startSubscriptions();
    } catch (error) {
      this.emit('error', error);
    }
  }

  public async close(): Promise<void> {
    this.server.close();
  }

  private startServer(): void {
    this.app.disable('x-powered-by');
    this.app.use(express.json());
    this.app.use(this.options.path || '/', this.handler.bind(this));

    this.server = createServer(this.app);

    this.server.on('listening', () => {
      this.emit('listening');
    });
    this.server.on('error', (error: any) => {
      this.emit('error', error);
    });

    this.logger.debug(`Server started at port ${this.options.port}`);
    this.server.listen(this.options.port || 3000);
  }

  private handler(req: express.Request, res: express.Response): void {
    switch (req.body.type) {
      case 'MESSAGE': {
        if (this.options.messageEventHandler) {
          const event = {
            type: 'MESSAGE',
            id: req.body.id,
            timestamp: req.body.timestamp,
            subscriptionId: req.body.subscriptionId,
            channel: req.body.channel,
            direction: req.body.direction,
            message: req.body.message,
          } as IMessageEvent;
          this.options.messageEventHandler(event);
        }
        break;
      }
      case 'MESSAGE_STATUS': {
        if (this.options.messageStatusEventHandler) {
          const event = {
            type: 'MESSAGE_STATUS',
            id: req.body.id,
            timestamp: req.body.timestamp,
            subscriptionId: req.body.subscriptionId,
            channel: req.body.channel,
            messageId: req.body.messageId,
            contentIndex: req.body.contentIndex,
            messageStatus: req.body.messageStatus} as IMessageStatusEvent;
          this.options.messageStatusEventHandler(event);
        }
        break;
      }
      default:
        // Do nothing
    }

    res.send();
  }

  private async startSubscriptions(): Promise<void> {
    if (this.options.client && this.options.url && this.options.channel &&
      (this.options.messageEventHandler || this.options.messageStatusEventHandler)) {
      const subscriptions: ISubscription[] = [];

      if (this.options.messageEventHandler) {
        subscriptions.push(new MessageSubscription(
          {
            url: this.options.url,
          },
          {
            channel: this.options.channel,
            direction: this.options.direction,
          },
        ));
      }

      if (this.options.messageStatusEventHandler) {
        subscriptions.push(new MessageStatusSubscription(
          {
            url: this.options.url,
          },
          {
            channel: this.options.channel,
          },
        ));
      }

      for (const subscription of subscriptions) {
        try {
          await this.options.client.createSubscription(subscription);
        } catch (error) {
          if (error.httpStatusCode === HTTP_CONFLICT_ERROR) {
            this.logger.debug(`Subscription already exists. ${JSON.stringify(subscription)}`);
          } else {
            throw error;
          }
        }
      }
    }
  }

}
