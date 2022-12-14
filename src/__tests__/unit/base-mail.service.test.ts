import { BaseUser, PasswordResetToken } from '../../models';
import { BaseMailService } from '../../services';
import { Transporter } from 'nodemailer';
import { DefaultEntityOmitKeys } from '../../types';
import { readFileSync } from 'fs';
import { expect } from '@loopback/testlab';

// eslint-disable-next-line jsdoc/require-jsdoc
class MailService extends BaseMailService<string> {
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly WEBSERVER_MAIL: string = 'webserver@test.com';
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly BASE_RESET_PASSWORD_LINK: string = 'http://localhost:4200/reset-password';
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly webserverMailTransporter: Transporter;
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly PRODUCTION: boolean = false;
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly SAVED_EMAILS_PATH: string = './test-emails';
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly LOGO_HEADER_URL: string = 'https://via.placeholder.com/165x165';
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly LOGO_FOOTER_URL: string = 'https://via.placeholder.com/500x60';
    // eslint-disable-next-line jsdoc/require-jsdoc
    protected readonly ADDRESS_LINES: string[] = ['my address', 'my name'];
}

const mailService: MailService = new MailService();

describe('BaseMailService', () => {
    it('sendResetPasswordMail', async () => {
        const userData: Omit<BaseUser<string>, DefaultEntityOmitKeys | 'credentials'> = {
            id: '1',
            email: 'user@test.com',
            roles: []
        };
        const user: BaseUser<string> = new BaseUser(userData);
        const resetTokenData: Omit<PasswordResetToken, DefaultEntityOmitKeys> = {
            id: '1',
            expirationDate: new Date(Date.now() + 300000),
            value: 'my-great-token',
            baseUserId: '1'
        };
        const resetToken: PasswordResetToken = new PasswordResetToken(resetTokenData);
        await mailService.sendResetPasswordMail(user, resetToken);

        const createdEmail: string = readFileSync('./test-emails/PasswordReset.test.html', { encoding: 'utf-8' });

        expect(createdEmail).to.containEql('href="http://localhost:4200/reset-password/my-great-token"');
        expect(createdEmail).to.containEql('<title>Password Reset</title>');
        expect(createdEmail).to.containEql('font-family: Arial, sans-serif;');
        expect(createdEmail).to.containEql(
            'box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);'
        );
        expect(createdEmail).to.containEql(
            '<body style="margin: 0; padding: 0; word-spacing: normal; background-color: whitesmoke;">'
        );
        expect(createdEmail).to.containEql('color: #363636;');
        expect(createdEmail).to.containEql('background-color: white;');
        expect(createdEmail).to.containEql(
            '<img src="https://via.placeholder.com/165x165" width="165" style="width: 165px; max-width: 80%; height: auto;" alt="Logo">'
        );
        expect(createdEmail).to.containEql('<h1 style="margin-top: 0px; color: #363636; text-align: center;">Password Reset</h1>');
        expect(createdEmail).to.containEql(
            '<img src="https://via.placeholder.com/500x60" width="500" style="width: 500px; max-width: 80%; height: auto;" alt="Logo">'
        );
        expect(createdEmail).to.containEql('<span style="color: #999999; font-size: 12px; text-align: center;">');
        expect(createdEmail).to.containEql('my address');
        expect(createdEmail).to.containEql('my name');
    });
});