import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * CloudApiService — Official Meta WhatsApp Cloud API Engine
 *
 * This is a 100% self-sufficient service that communicates directly with
 * Meta's Graph API. No third-party WhatsApp libraries needed.
 *
 * Endpoint: https://graph.facebook.com/{version}/{phone_number_id}/messages
 * Auth: Bearer {permanent_access_token}
 */
@Injectable()
export class CloudApiService {
  private readonly logger = new Logger(CloudApiService.name);
  private readonly graphApiVersion: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.graphApiVersion = this.config.get('META_GRAPH_API_VERSION', 'v21.0');
  }

  // ──────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────

  private getBaseUrl(phoneNumberId: string): string {
    return `https://graph.facebook.com/${this.graphApiVersion}/${phoneNumberId}`;
  }

  private getWabaUrl(wabaId: string): string {
    return `https://graph.facebook.com/${this.graphApiVersion}/${wabaId}`;
  }

  /**
   * Fetch instance credentials from DB.
   * Throws if the instance is not a CLOUD_API type or is missing credentials.
   */
  private async getInstanceCredentials(instanceId: string) {
    const instance = await this.prisma.whatsAppInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new Error(`WhatsApp Instance ${instanceId} not found.`);
    }
    if (instance.connectionType !== 'CLOUD_API') {
      throw new Error(
        `Instance ${instanceId} is not a Cloud API instance (type: ${instance.connectionType}).`,
      );
    }
    if (!instance.phoneNumberId || !instance.accessToken) {
      throw new Error(
        `Instance ${instanceId} is missing phoneNumberId or accessToken.`,
      );
    }

    return instance;
  }

  /**
   * Core HTTP caller for Meta Graph API.
   * Uses native Node fetch (Node 18+). No axios dependency needed.
   */
  private async graphApiRequest(
    url: string,
    accessToken: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: any,
  ): Promise<any> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    this.logger.debug(`[Graph API] ${method} ${url}`);

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      this.logger.error(
        `[Graph API] Error ${response.status}: ${JSON.stringify(data)}`,
      );
      throw new Error(
        data?.error?.message ||
          `Graph API request failed with status ${response.status}`,
      );
    }

    return data;
  }

  // ──────────────────────────────────────────────────
  // SEND MESSAGES
  // ──────────────────────────────────────────────────

  /**
   * Send a simple text message.
   */
  async sendTextMessage(
    instanceId: string,
    to: string,
    text: string,
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''), // Strip non-numeric chars
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'POST',
      payload,
    );

    // Persist outbound message to DB
    const messageId =
      result?.messages?.[0]?.id || `cloud_${Date.now()}`;
    await this.prisma.whatsAppMessage.create({
      data: {
        messageId,
        instanceId,
        direction: 'OUTBOUND',
        remoteJid: to.replace(/\D/g, ''),
        messageType: 'text',
        messageData: { body: text } as any,
        status: 'SENT',
      },
    });

    this.logger.log(`[${instanceId}] Cloud API: Sent text to ${to}`);
    return { success: true, messageId, wamid: result?.messages?.[0]?.id };
  }

  /**
   * Send a pre-approved template message.
   * Required for initiating conversations outside the 24-hour service window.
   */
  async sendTemplateMessage(
    instanceId: string,
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[],
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/messages`;

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    };

    if (components && components.length > 0) {
      payload.template.components = components;
    }

    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'POST',
      payload,
    );

    // Persist outbound template message
    const messageId =
      result?.messages?.[0]?.id || `cloud_tmpl_${Date.now()}`;
    await this.prisma.whatsAppMessage.create({
      data: {
        messageId,
        instanceId,
        direction: 'OUTBOUND',
        remoteJid: to.replace(/\D/g, ''),
        messageType: 'template',
        messageData: {
          templateName,
          languageCode,
          components,
        } as any,
        status: 'SENT',
      },
    });

    this.logger.log(
      `[${instanceId}] Cloud API: Sent template '${templateName}' to ${to}`,
    );
    return { success: true, messageId, wamid: result?.messages?.[0]?.id };
  }

  /**
   * Send a media message (image, document, video, audio).
   */
  async sendMediaMessage(
    instanceId: string,
    to: string,
    mediaType: 'image' | 'document' | 'video' | 'audio',
    mediaUrl: string,
    caption?: string,
    filename?: string,
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/messages`;

    const mediaPayload: any = { link: mediaUrl };
    if (caption) mediaPayload.caption = caption;
    if (filename && mediaType === 'document') {
      mediaPayload.filename = filename;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: mediaType,
      [mediaType]: mediaPayload,
    };

    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'POST',
      payload,
    );

    const messageId =
      result?.messages?.[0]?.id || `cloud_media_${Date.now()}`;
    await this.prisma.whatsAppMessage.create({
      data: {
        messageId,
        instanceId,
        direction: 'OUTBOUND',
        remoteJid: to.replace(/\D/g, ''),
        messageType: mediaType,
        messageData: { mediaUrl, caption, filename } as any,
        status: 'SENT',
      },
    });

    this.logger.log(
      `[${instanceId}] Cloud API: Sent ${mediaType} to ${to}`,
    );
    return { success: true, messageId, wamid: result?.messages?.[0]?.id };
  }

  /**
   * Send an interactive message (buttons or list).
   */
  async sendInteractiveMessage(
    instanceId: string,
    to: string,
    interactive: any,
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/\D/g, ''),
      type: 'interactive',
      interactive,
    };

    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'POST',
      payload,
    );

    const messageId =
      result?.messages?.[0]?.id || `cloud_interactive_${Date.now()}`;
    await this.prisma.whatsAppMessage.create({
      data: {
        messageId,
        instanceId,
        direction: 'OUTBOUND',
        remoteJid: to.replace(/\D/g, ''),
        messageType: 'interactive',
        messageData: interactive as any,
        status: 'SENT',
      },
    });

    return { success: true, messageId, wamid: result?.messages?.[0]?.id };
  }

  /**
   * Mark a message as read (blue ticks).
   */
  async markAsRead(instanceId: string, wamid: string): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: wamid,
    };

    return this.graphApiRequest(url, instance.accessToken!, 'POST', payload);
  }

  // ──────────────────────────────────────────────────
  // TEMPLATE MANAGEMENT
  // ──────────────────────────────────────────────────

  /**
   * Fetch all templates from Meta and sync to local DB.
   */
  async syncTemplates(instanceId: string): Promise<any[]> {
    const instance = await this.getInstanceCredentials(instanceId);
    if (!instance.wabaId) {
      throw new Error(`Instance ${instanceId} has no WABA ID configured.`);
    }

    const url = `${this.getWabaUrl(instance.wabaId)}/message_templates`;
    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'GET',
    );

    const templates = result?.data || [];

    // Upsert each template to local DB
    for (const tmpl of templates) {
      await this.prisma.whatsAppTemplate.upsert({
        where: {
          instanceId_name_language: {
            instanceId,
            name: tmpl.name,
            language: tmpl.language,
          },
        },
        update: {
          templateId: tmpl.id,
          category: tmpl.category,
          status: tmpl.status,
          components: tmpl.components || [],
        },
        create: {
          instanceId,
          templateId: tmpl.id,
          name: tmpl.name,
          category: tmpl.category,
          language: tmpl.language,
          status: tmpl.status,
          components: tmpl.components || [],
        },
      });
    }

    this.logger.log(
      `[${instanceId}] Synced ${templates.length} templates from Meta.`,
    );
    return templates;
  }

  /**
   * Get all locally-cached templates for an instance.
   */
  async getTemplates(instanceId: string) {
    return this.prisma.whatsAppTemplate.findMany({
      where: { instanceId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new template on Meta's platform.
   */
  async createTemplate(
    instanceId: string,
    templateData: {
      name: string;
      category: string;
      language: string;
      components: any[];
    },
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    if (!instance.wabaId) {
      throw new Error(`Instance ${instanceId} has no WABA ID configured.`);
    }

    const url = `${this.getWabaUrl(instance.wabaId)}/message_templates`;
    const payload = {
      name: templateData.name,
      category: templateData.category.toUpperCase(),
      language: templateData.language,
      components: templateData.components,
    };

    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'POST',
      payload,
    );

    // Cache locally
    await this.prisma.whatsAppTemplate.create({
      data: {
        instanceId,
        templateId: result.id,
        name: templateData.name,
        category: templateData.category.toUpperCase(),
        language: templateData.language,
        status: result.status || 'PENDING',
        components: templateData.components as any,
      },
    });

    this.logger.log(
      `[${instanceId}] Created template '${templateData.name}' on Meta.`,
    );
    return result;
  }

  /**
   * Delete a template on Meta.
   */
  async deleteTemplate(
    instanceId: string,
    templateName: string,
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    if (!instance.wabaId) {
      throw new Error(`Instance ${instanceId} has no WABA ID configured.`);
    }

    const url = `${this.getWabaUrl(instance.wabaId)}/message_templates?name=${templateName}`;
    const result = await this.graphApiRequest(
      url,
      instance.accessToken!,
      'DELETE',
    );

    // Remove from local DB
    await this.prisma.whatsAppTemplate.deleteMany({
      where: { instanceId, name: templateName },
    });

    return result;
  }

  // ──────────────────────────────────────────────────
  // PHONE NUMBER MANAGEMENT
  // ──────────────────────────────────────────────────

  /**
   * Get all phone numbers registered to a WABA.
   */
  async getPhoneNumbers(instanceId: string): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    if (!instance.wabaId) {
      throw new Error(`Instance ${instanceId} has no WABA ID configured.`);
    }

    const url = `${this.getWabaUrl(instance.wabaId)}/phone_numbers`;
    return this.graphApiRequest(url, instance.accessToken!, 'GET');
  }

  /**
   * Get details of a specific phone number.
   */
  async getPhoneNumberDetails(instanceId: string): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}`;
    return this.graphApiRequest(url, instance.accessToken!, 'GET');
  }

  /**
   * Get the business profile for a phone number.
   */
  async getBusinessProfile(instanceId: string): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`;
    return this.graphApiRequest(url, instance.accessToken!, 'GET');
  }

  /**
   * Update the business profile for a phone number.
   */
  async updateBusinessProfile(
    instanceId: string,
    profileData: {
      about?: string;
      address?: string;
      description?: string;
      email?: string;
      websites?: string[];
      vertical?: string;
    },
  ): Promise<any> {
    const instance = await this.getInstanceCredentials(instanceId);
    const url = `${this.getBaseUrl(instance.phoneNumberId!)}/whatsapp_business_profile`;

    const payload = {
      messaging_product: 'whatsapp',
      ...profileData,
    };

    return this.graphApiRequest(url, instance.accessToken!, 'POST', payload);
  }

  // ──────────────────────────────────────────────────
  // EMBEDDED SIGNUP (FRICTIONLESS ONBOARDING)
  // ──────────────────────────────────────────────────

  /**
   * Called via Embedded Signup flow. Takes a user access token from the frontend
   * Facebook JS SDK, finds the WABA ID and Phone Number ID, and provisions
   * a new Cloud API WhatsAppInstance automatically.
   */
  async exchangeTokenAndProvision(
    tenantId: string,
    userAccessToken: string,
    instanceName: string = 'Official Cloud API',
  ): Promise<any> {
    try {
      // 1. Fetch exactly what WABA accounts this token has access to
      const debugUrl = `https://graph.facebook.com/${this.graphApiVersion}/me/whatsapp_business_accounts`;
      const wabaResult = await this.graphApiRequest(debugUrl, userAccessToken, 'GET');

      if (!wabaResult.data || wabaResult.data.length === 0) {
        throw new Error('No WhatsApp Business Accounts found for this user.');
      }

      // We'll provision the first WABA found (typical for standard setups)
      const wabaId = wabaResult.data[0].id;
      const businessName = wabaResult.data[0].name;

      // 2. Fetch the phone numbers attached to this WABA
      const phoneUrl = `https://graph.facebook.com/${this.graphApiVersion}/${wabaId}/phone_numbers`;
      const phoneResult = await this.graphApiRequest(phoneUrl, userAccessToken, 'GET');

      if (!phoneResult.data || phoneResult.data.length === 0) {
        throw new Error('No phone numbers found attached to this WABA.');
      }

      const phoneNumberId = phoneResult.data[0].id;
      const displayPhoneNumber = phoneResult.data[0].display_phone_number;

      // 3. Provision the instance in the local database
      // The frontend user accessToken acts as our starting token. 
      // (In a full production setup, you would exchange this for a long-lived System User token).
      const instance = await this.prisma.whatsAppInstance.create({
        data: {
          tenantId,
          name: `${businessName || instanceName} (${displayPhoneNumber})`,
          connectionType: 'CLOUD_API',
          connectionStatus: 'connected', // Automatically connected!
          phoneNumberId,
          wabaId,
          accessToken: userAccessToken,
          phoneNumber: displayPhoneNumber,
          businessName: businessName,
          webhookVerifyToken: this.config.get('META_WEBHOOK_VERIFY_TOKEN', 'karan_saas_webhook_verify'),
        },
      });

      this.logger.log(`[Embedded Signup] Successfully auto-provisioned Cloud API instance: ${instance.id}`);
      return { success: true, instance };
    } catch (error) {
      this.logger.error(`[Embedded Signup Error] ${(error as Error).message}`);
      throw error;
    }
  }
}
