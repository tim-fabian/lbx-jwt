# lbx-jwt
This packages aims to take care of most of your authentication and authorization concerns.

It's inspired by [@loopback/authentication-jwt](https://loopback.io/doc/en/lb4/JWT-authentication-extension.html)
but adds a lot more functionality, including:
- Saving roles inside jwts
- Handling refresh tokens and [automatic reuse detection](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/#Refresh-Token-Automatic-Reuse-Detection)
- Providing an out of the box controller for:
  - login
  - logout
  - refreshing the token
  - requesting the reset of a password (Including an html email sent to the user or saved locally, depending on the environment)
  - confirming and actually resetting the password
- Providing a simple role authorizer to use with the @authorize decorator

# Usage
## Register the component

The minimum required code changes to use the library to its full extend is simply registering it in the `application.ts`:
```typescript
import { BaseUserRepository, CredentialsRepository, LbxJwtBindings, LbxJwtComponent, RefreshTokenRepository, PasswordResetTokenRepository, LbxJwtAuthController } from 'lbx-jwt';
import { AuthenticationComponent } from '@loopback/authentication';
import { AuthorizationBindings, AuthorizationComponent, AuthorizationDecision, AuthorizationOptions } from '@loopback/authorization';

export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
    constructor(options: ApplicationConfig = {}) {
        // ...
        this.component(AuthenticationComponent);
        this.component(LbxJwtComponent);
        this.bind(LbxJwtBindings.ACCESS_TOKEN_SECRET).to('JwtS3cr3t');
        this.bind(LbxJwtBindings.REFRESH_TOKEN_SECRET).to('JwtR3fr3shS3cr3t');
        this.bind(LbxJwtBindings.MAIL_SERVICE).toClass(MailService);
        this.repository(BaseUserRepository);
        this.repository(CredentialsRepository);
        this.repository(RefreshTokenRepository);
        this.repository(PasswordResetTokenRepository);
        this.controller(LbxJwtAuthController);

        const authOptions: AuthorizationOptions = {
            precedence: AuthorizationDecision.DENY,
            defaultDecision: AuthorizationDecision.DENY
        };
        this.configure(AuthorizationBindings.COMPONENT).to(authOptions);
        this.component(AuthorizationComponent);
        // ...
    }
}
```

If you don't want to use the predefined controller you can omit the `this.controller(LbxJwtAuthController);` part.

Almost everything above comes from the library out of the box. You only need to create your own MailService.

## Create your own MailService

```typescript
@injectable({ scope: BindingScope.TRANSIENT })
export class MailService extends BaseMailService<Roles> {
    protected readonly WEBSERVER_MAIL: string = 'webserver@test.com';
    protected readonly BASE_RESET_PASSWORD_LINK: string = 'http://localhost:4200/reset-password';
    protected readonly webserverMailTransporter: Transporter;
    protected readonly PRODUCTION: boolean = false;
    protected readonly SAVED_EMAILS_PATH: string = path.join(__dirname, '../../../test-emails');
    protected readonly LOGO_HEADER_URL: string = 'https://via.placeholder.com/165x165';
    protected readonly LOGO_FOOTER_URL: string = 'https://via.placeholder.com/500x60';
    protected readonly ADDRESS_LINES: string[] = ['my address', 'my name'];
}
```

## Enjoy!
That's it, now you can use it inside your code:
```typescript
import { roleAuthorization } from 'lbx-jwt';
// ...
@authenticate('jwt')
@authorize({ voters: [roleAuthorization], allowedRoles: ['admin'] })
getAdminExclusiveData(): string {
    // ...
}
// ...
```

# Customization
The library is highly customizable through the usage of Bindings.

Almost everything can be overriden by you when you provide a value for the specific Binding:

```typescript
import { LbxJwtBindings } from 'lbx-jwt';
// ...
this.bind(LbxJwtBindings.ACCESS_TOKEN_EXPIRES_IN_MS).to(1234567);
// ...
```

All bindings can be accessed under `LbxJwtBindings`.