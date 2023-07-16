export interface IConfigurationService {
  getServiceName(): Promise<string>,
  getServiceIconUri(): Promise<string>,
  getServiceUri(): Promise<string>,
  getMiAuthCallback(): Promise<string>,
}

export class DummyConfigurationService implements IConfigurationService {
  async getServiceName(): Promise<string> {
    return "AutoNote for Misskey";
  }
  async getServiceIconUri(): Promise<string> {
    return "https://media.superneko.net/file/superneko-net-misskey/static/superneko.png";
  }
  async getServiceUri(): Promise<string> {
    return "http://localhost:3000";
  }
  async getMiAuthCallback(): Promise<string> {
    return `${await this.getServiceUri()}/api/miauth/finish`;
  }
}
