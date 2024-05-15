import { Injectable, ExecutionContext, ContextType } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtValidationGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const contextType: ContextType | GqlContextType = context.getType();
    let request: Request = null;
    switch (contextType) {
      case 'http':
        request = context.getArgByIndex(0);
        break;
      case 'graphql':
        {
          const gqlCtx = GqlExecutionContext.create(context);
          request = gqlCtx.getContext().req;
        }
        break;
      case 'ws':
        {
          request = context.switchToWs().getClient().request;
          const auth = context.switchToWs().getClient().handshake.auth;
          request.headers.authorization = auth.authorization;
        }
        break;
    }

    return request;
  }
}
