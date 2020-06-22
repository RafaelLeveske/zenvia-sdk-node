/* tslint:disable:no-unused-expression */

import * as nock from 'nock';
import { IContent, Channel, Client, TextContent, TemplateContent, FileContent, Template, MessageSubscription, MessageStatusSubscription } from '../../src';
import { ITemplate } from '../../src/types/zenvia';
import { ContactsContent, LocationContent } from '../../dist';

describe('Client', () => {

  describe('Messages', () => {

    describe('SMS Channel', () => {

      it('should send message with text content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'text',
              text: 'some text message',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/sms/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const content = new TextContent('some text message');
        const actualMessageResponse = await sms.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with an array of text content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'text',
              text: 'first text message',
            },
            {
              type: 'text',
              text: 'second text message',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/sms/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const contents = [new TextContent('first text message'), new TextContent('second text message')];
        const actualMessageResponse = await sms.sendMessage('FROM', 'TO', ...contents);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should fail when trying to send template content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const content = new TemplateContent('templateId', {});

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type template is not supported in SMS channel');
        }
      });

      it('should fail when trying to send file content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const content = new FileContent('fileUrl', 'fileMimeType', 'fileCaption');

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type file is not supported in SMS channel');
        }
      });

      it('should fail when trying to send location content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const content = new LocationContent(-46.511170, -23.442930, 'Name of location', 'Address of location', 'URL');

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type location is not supported in SMS channel');
        }
      });

      it('should fail when trying to send contacts content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('sms');
        const content = new ContactsContent([]);

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type contacts is not supported in SMS channel');
        }
      });

    });

    describe('Facebook Channel', () => {

      it('should send message with text content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'text',
              text: 'some text message',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/facebook/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const facebook = client.getChannel('facebook');
        const content = new TextContent('some text message');
        const actualMessageResponse = await facebook.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with file content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'file',
              fileUrl: 'http://server.com/file.jpeg',
              fileMimeType: 'image/jpeg',
              fileCaption: 'some file caption',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/facebook/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const facebook = client.getChannel('facebook');
        const content = new FileContent('http://server.com/file.jpeg', 'image/jpeg', 'some file caption');
        const actualMessageResponse = await facebook.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should fail when trying to send template content', async () => {
        const client = new Client('SOME_TOKEN');
        const facebook = client.getChannel('facebook');
        const content = new TemplateContent('templateId', {});

        try {
          await facebook.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type template is not supported in Facebook channel');
        }
      });

      it('should fail when trying to send array with template content', async () => {
        const client = new Client('SOME_TOKEN');
        const facebook = client.getChannel('facebook');
        const textContent = new TextContent('some text message');
        const templateContent = new TemplateContent('templateId', {});

        try {
          await facebook.sendMessage('FROM', 'TO', textContent, templateContent);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type template is not supported in Facebook channel');
        }
      });

      it('should fail when trying to send location content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('facebook');
        const content = new LocationContent(-46.511170, -23.442930, 'Name of location', 'Address of location', 'URL');

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type location is not supported in Facebook channel');
        }
      });

      it('should fail when trying to send contacts content', async () => {
        const client = new Client('SOME_TOKEN');
        const sms = client.getChannel('facebook');
        const content = new ContactsContent([]);

        try {
          await sms.sendMessage('FROM', 'TO', content);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type contacts is not supported in Facebook channel');
        }
      });
    });

    describe('WhatsApp Channel', () => {

      it('should send message with text content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'text',
              text: 'some text message',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new TextContent('some text message');
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with file content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'file',
              fileUrl: 'http://server.com/file.jpeg',
              fileMimeType: 'image/jpeg',
              fileCaption: 'some file caption',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new FileContent('http://server.com/file.jpeg', 'image/jpeg', 'some file caption');
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with array of text content and file content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'text',
              text: 'some text message',
            },
            {
              type: 'file',
              fileUrl: 'http://server.com/file.jpeg',
              fileMimeType: 'image/jpeg',
              fileCaption: 'some file caption',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const textContent = new TextContent('some text message');
        const fileContent = new FileContent('http://server.com/file.jpeg', 'image/jpeg', 'some file caption');
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', textContent, fileContent);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with template content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'template',
              templateId: 'templateId',
              fields: {
                fieldA: 'value A',
                fieldB: 'value B',
              },
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new TemplateContent('templateId', { fieldA: 'value A', fieldB: 'value B' });
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with contacts content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'contacts',
              contacts: [{
                name: {
                  formattedName: 'Number of Contact',
                  firstName: 'First name',
                },
                phones: [
                  {
                    phone: '5511222222222',
                    type: 'CELL',
                    waId: '+5511222222222',
                  },
                ],
              }],
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new ContactsContent(
          [
            {
              name: {
                formattedName: 'Number of Contact',
                firstName: 'First name',
              },
              phones: [
                {
                  phone: '5511222222222',
                  type: 'CELL',
                  waId: '+5511222222222',
                },
              ],
            },
          ],
        );
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with location content', async () => {
        const expectedMessage = {
          from: 'FROM',
          to: 'TO',
          contents: [
            {
              type: 'location',
              longitude: -46.511170,
              latitude: -23.442930,
              name: 'Name of location',
              address: 'Address of location',
              url: 'URL',
            },
          ],
        };
        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages', expectedMessage)
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(200, expectedMessage);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new LocationContent(
          -46.511170,
          -23.442930,
          'Name of location',
          'Address of location',
          'URL',
        );
        const actualMessageResponse = await whatsapp.sendMessage('FROM', 'TO', content);
        zenviaNock.isDone().should.be.true;
        actualMessageResponse.should.be.deep.equal(expectedMessage);
      });

      it('should send message with contacts content', async () => {
        const errorResponse = {
          code: 'VALIDATION_ERROR',
          message: 'Request has one or more errors\n  In body\n    For Content-Type application/json\n      Invalid value\n        Did not validate against all schemas\n          at: 1 > contents > 0 > contacts\n            Did not validate against all schemas\n              at: 1 > contacts\n                Too few items in the array. Minimum of 1. Found 0 items',
        };

        const zenviaNock = nock('https://api.zenvia.com')
        .post('/v1/channels/whatsapp/messages')
        .matchHeader('X-API-Token', 'SOME_TOKEN')
        .reply(400, errorResponse);

        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');
        const content = new ContactsContent([]);
        try {
          await whatsapp.sendMessage('FROM', 'TO', content);
        } catch (error) {
          error.should.be.deep.equal({ httpStatusCode: 400, message: 'Unsuccessful request', body: errorResponse });
        }
        zenviaNock.isDone().should.be.true;
      });

      it('should fail when trying to send invalid content', async () => {
        const client = new Client('SOME_TOKEN');
        const whatsapp = client.getChannel('whatsapp');

        try {
          await whatsapp.sendMessage('FROM', 'TO', {} as IContent);
          throw new Error('An expected error was not throwed');
        } catch (error) {
          error.message.should.be.deep.equal('Content of type undefined is not supported in WhatsApp channel');
        }
      });

    });

  });

  describe('Subscription', () => {

    it('should list subscriptions', async () => {
      const expectedSubscription = [{
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'ACTIVE',
      }];
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/subscriptions')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.listSubscriptions();
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should create subscription for MESSAGE eventType', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'ACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/subscriptions', expectedSubscription)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const subscription = new MessageSubscription({ url: 'https://my-webhook.com' }, { channel: 'whatsapp' });
      const actualMessageResponse = await client.createSubscription(subscription);
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should create subscription for MESSAGE eventType with message direction', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
          direction: 'IN',
        },
        status: 'ACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/subscriptions', expectedSubscription)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const subscription = new MessageSubscription({ url: 'https://my-webhook.com' }, { channel: 'whatsapp', direction: 'IN' });
      const actualMessageResponse = await client.createSubscription(subscription);
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should create subscription for MESSAGE_STATUS eventType', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE_STATUS',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'ACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/subscriptions', expectedSubscription)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const subscription = new MessageStatusSubscription({ url: 'https://my-webhook.com' }, { channel: 'whatsapp' });
      const actualMessageResponse = await client.createSubscription(subscription);
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should create subscription setting status as INACTIVE', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'INACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/subscriptions', expectedSubscription)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const subscription = new MessageSubscription({ url: 'https://my-webhook.com' }, { channel: 'whatsapp' }, 'INACTIVE');
      const actualMessageResponse = await client.createSubscription(subscription);
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should get subscription with id', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'INACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/subscriptions/SOME_SUBSCRIPTION_ID')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.getSubscription('SOME_SUBSCRIPTION_ID');
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should update subscription', async () => {
      const expectedSubscription = {
        eventType: 'MESSAGE',
        webhook: {
          url: 'https://my-webhook.com',
        },
        criteria: {
          channel: 'whatsapp',
        },
        status: 'INACTIVE',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .patch('/v1/subscriptions/SOME_SUBSCRIPTION_ID', { status: 'INACTIVE' })
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedSubscription);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.updateSubscription('SOME_SUBSCRIPTION_ID', { status: 'INACTIVE' });
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedSubscription);
    });

    it('should delete subscription', async () => {
      const zenviaNock = nock('https://api.zenvia.com')
      .delete('/v1/subscriptions/SOME_SUBSCRIPTION_ID')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(204);

      const client = new Client('SOME_TOKEN');
      await client.deleteSubscription('SOME_SUBSCRIPTION_ID');
      zenviaNock.isDone().should.be.true;
    });

  });

  describe('Reports', () => {

    it('should list a flow reports with startDate', async () => {
      const expectedFlow = [{
        sessionId: 'session_id',
        flowId: 'flow_id',
        firstEventTimestamp: '2019-11-01T20:26:17.752Z',
        lastEventTimestamp: '2020-01-10T02:09:26.390Z',
        variables: {
          tipoTelefone: 'CELULAR',
          tel: '',
          countTries: '1',
          telFormatado: '',
          user_email: 'test',
          is_email_valid: 'false',
        },
      }];
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/reports/flow/entries?startDate=2020-01-10')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedFlow);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.listFlowReport('2020-01-10');
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedFlow);
    });

    it('should list a message reports with startDate and endDate', async () => {
      const expectedMessage = [
        {
          channel: 'whatsapp',
          type: 'message',
          directionInTotal: 17,
          directionOutTotal: 0,
          total: 17,
        },
        {
          channel: 'whatsapp',
          type: 'notification',
          directionInTotal: 0,
          directionOutTotal: 7,
          total: 7,
        },
      ];
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/reports/message/entries?startDate=2020-01-10&endDate=2020-01-11')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedMessage);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.listMessageReport('2020-01-10', '2020-01-11');
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(expectedMessage);
    });

    it('should fail when trying list a flow reports without startDate', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Request has one or more errors\n  In query parameters\n    Missing required parameter: startDate',
      };

      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/reports/flow/entries?startDate=')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(400, errorResponse);

      const client = new Client('SOME_TOKEN');
      try {
        await client.listFlowReport('');
      } catch (error) {
        error.should.be.deep.equal({ httpStatusCode: 400, message: 'Unsuccessful request', body: errorResponse });
      }
      zenviaNock.isDone().should.be.true;
    });

    it('should fail when trying list a message reports without startDate and endDate', async () => {
      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Request has one or more errors\n  In query parameters\n    Missing required parameter: startDate, endDate',
      };

      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/reports/message/entries?startDate=&endDate=')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(400, errorResponse);

      const client = new Client('SOME_TOKEN');
      try {
        await client.listMessageReport('', '');
      } catch (error) {
        error.should.be.deep.equal({ httpStatusCode: 400, message: 'Unsuccessful request', body: errorResponse });
      }
      zenviaNock.isDone().should.be.true;
    });
  });

  describe('Errors', () => {

    it('should throw unsupported channel error', () => {
      const client = new Client('SOME_TOKEN');

      try {
        client.getChannel('invalid' as Channel);
        throw new Error('An expected error was not throwed');
      } catch (error) {
        error.message.should.be.equal('Unsupported channel');
      }
    });

    it('should handle request http error', async () => {
      const errorResponse = {
        code: 'AUTHENTICATION_ERROR',
        message: 'Please make sure if a valid JWT token was sent',
      };

      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/subscriptions')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(400, errorResponse);

      const client = new Client('SOME_TOKEN');
      try {
        await client.listSubscriptions();
        throw new Error('An expected error was not throwed');
      } catch (error) {
        error.should.be.deep.equal({ httpStatusCode: 400, message: 'Unsuccessful request', body: errorResponse });
      }
      zenviaNock.isDone().should.be.true;
    });

    it('should handle technical error', async () => {
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/subscriptions')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .replyWithError('getaddrinfo ENOTFOUND api.zenvia.com');

      const client = new Client('SOME_TOKEN');
      try {
        await client.listSubscriptions();
        throw new Error('An expected error was not throwed');
      } catch (error) {
        error.message.should.be.equal('Error: getaddrinfo ENOTFOUND api.zenvia.com');
        error.causedBy.should.not.be.null;
      }
      zenviaNock.isDone().should.be.true;
    });

  });
  describe('Templates', () => {

    it('should list templates', async () => {
      const requestTemplates = [{
        text: 'Hello {{name}}, your ticket was registered in our service through ticket {{ticketId}}. Soon we will have new information about the ticket.',
        fields: [
          'name',
          'ticketId',
        ],
        channels: [
          {
            type: 'WHATSAPP',
            senderId: '4fa34b97-b093-445b-9b74-e62df2fd426b',
            status: 'APPROVED',
          },
          {
            type: 'WHATSAPP',
            senderId: '5jh87b12-p124-112b-0b74-e6k4a2cv456c',
            status: 'APPROVED',
          },
        ],
      }];
      const responseTemplates = [{
        text: 'Hello {{name}}, your ticket was registered in our service through ticket {{ticketId}}. Soon we will have new information about the ticket.',
        fields: [
          'name',
          'ticketId',
        ],
        channels: [
          {
            type: 'whatsapp',
            senderId: '4fa34b97-b093-445b-9b74-e62df2fd426b',
            status: 'APPROVED',
          },
          {
            type: 'whatsapp',
            senderId: '5jh87b12-p124-112b-0b74-e6k4a2cv456c',
            status: 'APPROVED',
          },
        ],
      }];
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/templates')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, requestTemplates);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.listTemplates();
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(responseTemplates);
    });

    it('should get template with id', async () => {
      const requestTemplates = {
        text: 'Hello {{name}}, your ticket was registered in our service through ticket {{ticketId}}. Soon we will have new information about the ticket.',
        fields: [
          'name',
          'ticketId',
        ],
        channels: [
          {
            type: 'WHATSAPP',
            senderId: '4fa34b97-b093-445b-9b74-e62df2fd426b',
            status: 'APPROVED',
          },
        ],
      };
      const responseTemplates = {
        text: 'Hello {{name}}, your ticket was registered in our service through ticket {{ticketId}}. Soon we will have new information about the ticket.',
        fields: [
          'name',
          'ticketId',
        ],
        channels: [
          {
            type: 'whatsapp',
            senderId: '4fa34b97-b093-445b-9b74-e62df2fd426b',
            status: 'APPROVED',
          },
        ],
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .get('/v1/templates/SOME_TEMPLATE_ID')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, requestTemplates);

      const client = new Client('SOME_TOKEN');
      const actualMessageResponse = await client.getTemplate('SOME_TEMPLATE_ID');
      zenviaNock.isDone().should.be.true;
      actualMessageResponse.should.be.deep.equal(responseTemplates);
    });

    it('should create a template and return success', async () => {
      const expectedTemplate = {
        name: 'Name of Template - SDK',
        locale: 'pt_BR',
        channel: 'WHATSAPP',
        category: 'ACCOUNT_UPDATE',
        senderId: 'sender_id',
        notificationEmail: 'mail@zenvia.com',
        components: {
          header: {
            type: 'MEDIA_DOCUMENT',
          },
          body: {
            type: 'TEXT_TEMPLATE',
            text: 'Hello, {{name}}. The ticket {{ticketId}} will be send to your mail.',
          },
          footer: {
            type: 'TEXT_FIXED',
            text: 'Zenvia Company.',
          },
        },
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/templates', expectedTemplate)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(200, expectedTemplate);

      const client = new Client('SOME_TOKEN');
      const actualTemplateResponse = await client.createTemplate(
        {
          name: 'Name of Template - SDK',
          locale: 'pt_BR',
          channel: 'WHATSAPP',
          category: 'ACCOUNT_UPDATE',
          senderId: 'sender_id',
          notificationEmail: 'mail@zenvia.com',
          components: {
            header: {
              type: 'MEDIA_DOCUMENT',
            },
            body: {
              type: 'TEXT_TEMPLATE',
              text: 'Hello, {{name}}. The ticket {{ticketId}} will be send to your mail.',
            },
            footer: {
              type: 'TEXT_FIXED',
              text: 'Zenvia Company.',
            },
          },
        } as ITemplate,
      );
      zenviaNock.isDone().should.be.true;
      actualTemplateResponse.should.be.deep.equal(expectedTemplate);
    });

    it('should delete template', async () => {
      const zenviaNock = nock('https://api.zenvia.com')
      .delete('/v1/templates/SOME_TEMPLATE_ID')
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(204);

      const client = new Client('SOME_TOKEN');
      await client.deleteTemplate('SOME_TEMPLATE_ID');
      zenviaNock.isDone().should.be.true;
    });

    it('should fail when trying create a template without required field', async () => {
      const expectedTemplate = {
        locale: 'pt_BR',
        channel: 'WHATSAPP',
        category: 'ACCOUNT_UPDATE',
        senderId: 'sender_id',
        notificationEmail: 'mail@zenvia.com',
        components: {
          header: {
            type: 'MEDIA_DOCUMENT',
          },
          body: {
            type: 'TEXT_TEMPLATE',
            text: 'Hello, {{name}}. The ticket {{ticketId}} will be send to your mail.',
          },
          footer: {
            type: 'TEXT_FIXED',
            text: 'Zenvia Company.',
          },
        },
      };

      const errorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Request has one or more errors\n  In body\n    For Content-Type application/json\n      Invalid value\n        One or more required properties missing: name',
      };
      const zenviaNock = nock('https://api.zenvia.com')
      .post('/v1/templates', expectedTemplate)
      .matchHeader('X-API-Token', 'SOME_TOKEN')
      .reply(400, errorResponse);

      const client = new Client('SOME_TOKEN');
      try {
        await client.createTemplate({
          locale: 'pt_BR',
          channel: 'WHATSAPP',
          category: 'ACCOUNT_UPDATE',
          senderId: 'sender_id',
          notificationEmail: 'mail@zenvia.com',
          components: {
            header: {
              type: 'MEDIA_DOCUMENT',
            },
            body: {
              type: 'TEXT_TEMPLATE',
              text: 'Hello, {{name}}. The ticket {{ticketId}} will be send to your mail.',
            },
            footer: {
              type: 'TEXT_FIXED',
              text: 'Zenvia Company.',
            },
          },
        } as ITemplate);
      } catch (error) {
        error.should.be.deep.equal({ httpStatusCode: 400, message: 'Unsuccessful request', body: errorResponse });
      }
      zenviaNock.isDone().should.be.true;
    });

  });
});
