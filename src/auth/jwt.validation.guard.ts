import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtValidationGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const contextType = context.getType();
    let request;

    switch (contextType) {
      case 'http':
        request = context.switchToHttp().getRequest();
        break;
      case 'rpc':
        request = context.switchToRpc().getData();
        break;
      case 'ws':
        const socket = context.switchToWs().getClient();
        request = socket.handshake;
        const auth = socket.handshake.auth;
        request.headers = {
          ...request.headers,
          authorization: auth.authorization,
        };
        break;
      default:
        if (contextType === 'graphql') {
          const gqlContext = GqlExecutionContext.create(context);
          request = gqlContext.getContext().req;
        } else {
          throw new Error(`Unsupported context type: ${contextType}`);
        }
    }

    return request;
  }
}
