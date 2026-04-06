import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(tenantId: string) {
    return this.prisma.subscriptionPlan.findFirst({
      where: { tenantId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPlans() {
    return [
      { name: 'free', displayName: 'Free', price: 0, features: ['2 users', '10 records', 'Basic support'] },
      { name: 'starter', displayName: 'Starter', price: 299, features: ['10 users', '500 records', 'Email support'] },
      { name: 'professional', displayName: 'Professional', price: 799, features: ['50 users', 'Unlimited records', 'Priority support'] },
      { name: 'enterprise', displayName: 'Enterprise', price: 1499, features: ['Unlimited users', 'Unlimited records', 'Dedicated support', 'Custom integrations'] },
    ];
  }
}
