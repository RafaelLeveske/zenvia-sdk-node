import { Channel, IChannel, IBatch, ILoggerInstance, ISubscription, IPartialSubscription, IPartialTemplate } from '../types';
import { Logger } from '../utils/logger';
import { SmsChannel } from './channels/sms';
import { RcsChannel } from './channels/rcs';
import { FacebookChannel } from './channels/facebook';
import { WhatsAppChannel } from './channels/whatsapp';
import * as request from '../utils/request';
import { ITemplate, IFlowReport, IMessageReport, MessageType, Batch } from '../types/zenvia';
import { ReportFlow } from './reports/report-flow';
import { ReportMessages } from './reports/report-messages';
import { ReadStream } from 'fs';
import * as fs from 'fs';


/**
 * Client class with the features.
 */
export class Client {

  private token: string;
  protected logger: Logger;

  /**
   * Returns a new `Client` that can be used to execute some functionality.
   *
   * @param token Zenvia platform token.
   * @param loggerInstance If you want, you can pass your log instance.
   */
  constructor(token: string, loggerInstance?: ILoggerInstance) {
    this.token = token;
    this.logger = new Logger(loggerInstance);
  }

  /**
   * This method returns a channel type object.
   *
   * @param channel [[Channel]] of the instance that you want to create.
   * @returns [[Channel]] type instance.
   */
  getChannel(channel: Channel): IChannel {
    switch (channel) {
      case 'sms': return new SmsChannel(this.token, this.logger);
      case 'rcs': return new RcsChannel(this.token, this.logger);
      case 'facebook': return new FacebookChannel(this.token, this.logger);
      case 'whatsapp': return new WhatsAppChannel(this.token, this.logger);
      default: throw new Error('Unsupported channel');
    }
  }

  sendBatchFile(contacts: string, batch: IBatch): Promise<Batch> {
    return this.sendBatch(fs.createReadStream(contacts), batch);
  }

  sendBatch(contacts: ReadStream, batch: IBatch): Promise<Batch> {
    const formData = {
      batch: JSON.stringify(batch),
      contacts: {
        value: contacts,
        options: {
          filename: 'contacts.csv',
          contentType: 'text/csv',
        },
      },
    };

    const path = '/v2/message-batches';
    return request.post(this.token, path, formData, this.logger);
    // contacts multipart
    // createTransfrom + createHTTP (API CONTROL)
    // Print batch for testing
  }

  /**
   * This method returns a list of flow reports.
   *
   * @returns [[ReportFlow]] type instance.
   */
  getFlowReportClient(): ReportFlow {
    return new ReportFlow(this.token, this.logger);
  }
  
  /**
   * This method returns a list of message reports.
   *
   * @returns [[ReportMessages]] type instance.
   */
  getMessagesReportClient(): ReportMessages  {
    return new ReportMessages(this.token, this.logger);
  }

  /**
   * This method returns a list of subscriptions.
   *
   * @returns A promise that resolves to an array of [[ISubscription]] objects.
   */
  async listSubscriptions(): Promise<ISubscription[]> {
    const path = '/v1/subscriptions';
    return request.get(this.token, path, this.logger);
  }

  /**
   * This method creates a subscription.
   *
   * @param subscription An [[ISubscription]] object.
   * @returns A promise that resolves to an [[ISubscription]] object.
   */
  async createSubscription(subscription: ISubscription): Promise<ISubscription> {
    const path = '/v1/subscriptions';
    return request.post(this.token, path, subscription, this.logger);
  }

  /**
   * This method returns a subscription.
   *
   * @param id Subscription identifier.
   * @returns A promise that resolves to an [[ISubscription]] object.
   */
  async getSubscription(id: string): Promise<ISubscription> {
    const path = `/v1/subscriptions/${id}`;
    return request.get(this.token, path, this.logger);
  }

  /**
   * This method updates a subscription.
   *
   * @param id Subscription identifier.
   * @param subscription An [[IPartialSubscription]] object.
   * @returns A promise that resolves to an [[ISubscription]] object.
   */
  async updateSubscription(id: string, subscription: IPartialSubscription): Promise<ISubscription> {
    const path = `/v1/subscriptions/${id}`;
    return request.patch(this.token, path, subscription, this.logger);
  }

  /**
   * This method deletes a subscription.
   *
   * @param id Subscription identifier.
   * @returns A promise that resolves to an [[ISubscription]] object.
   */
  async deleteSubscription(id: string): Promise<void> {
    const path = `/v1/subscriptions/${id}`;
    return request.del(this.token, path, this.logger);
  }

  /**
   * This method returns a list of templates.
   *
   * @returns A promise that resolves to an array of [[ITemplate]] objects.
   */
  async listTemplates(): Promise<ITemplate[]> {
    const path = '/v1/templates';
    return request.get(this.token, path, this.logger)
    .then((templates) => {
      templates.forEach((template) => {
        template.channels.forEach((channel) => {
          (channel.type as any) = channel.type.toLowerCase();
        });
      });
      return templates;
    });
  }

  /**
   * This method returns a template.
   *
   * @param id Template identifier.
   * @returns A promise that resolves to an [[ITemplate]] object.
   */ 
  async getTemplate(id: string): Promise<ITemplate> {
    const path = `/v1/templates/${id}`;
    return request.get(this.token, path, this.logger)
    .then((template: ITemplate) => {
      template.channels.forEach((channel) => {
        (channel.type as any) = channel.type.toLowerCase();
      });
      return template;
    });
  }

  /**
   * This method creates a template.
   *
   * @param template An [[ITemplate]] object.
   * @returns A promise that resolves to an [[ITemplate]] object.
   */
  async createTemplate(template: ITemplate): Promise<ITemplate> {
    const path = '/v1/templates';
    return request.post(this.token, path, template, this.logger);
  }

  /**
   * This method updates a template.
   *
   * @param id Template identifier.
   * @param template An [[IPartialTemplate]] object.
   * @returns A promise that resolves to an [[ITemplate]] object.
   */
  async updateTemplate(id: string, template: IPartialTemplate): Promise<ITemplate> {
    const path = `/v1/templates/${id}`;
    return request.patch(this.token, path, template, this.logger);
  }

  /**
   * This method deletes a template.
   *
   * @param id Template identifier.
   * @returns A promise that resolves to an [[ITemplate]] object.
   */
  async deleteTemplate(id: string): Promise<void> {
    const path = `/v1/templates/${id}`;
    return request.del(this.token, path, this.logger);
  }

}
