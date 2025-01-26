<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { Inbox, MessageSquare, Users, Clock, Shield, ChartBar, Instagram, Mail, MessageCircle } from 'lucide-svelte';
  import GradientSection from '$lib/components/GradientSection.svelte';
  import CustomArc from '$lib/components/dashboard/CustomArc.svelte';

const features = [
  {
    icon: Inbox,
    title: "Unified Inbox",
    description: "Manage all customer conversations in one place with our intuitive inbox interface.",
    delay: 0
  },
  {
    icon: MessageSquare,
    title: "Smart Responses",
    description: "Save time with AI-powered response suggestions and templates.",
    delay: 200
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team through shared inboxes and assignments.",
    delay: 400
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Stay on top of customer inquiries with instant notifications and live updates.",
    delay: 600
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Enterprise-grade security to keep your customer data safe and compliant.",
    delay: 800
  },
  {
    icon: ChartBar,
    title: "Analytics & Insights",
    description: "Make data-driven decisions with comprehensive reporting and analytics.",
    delay: 1000
  }
];

const metrics = {
  aiHandling: 87,
  responseTime: 92,
  satisfaction: 95,
  resolution: 89
};

const channels = [
  {
    icon: Instagram,
    name: "Instagram",
    description: "Handle DMs and comments directly from your inbox"
  },
  {
    icon: Mail,
    name: "Email",
    description: "Manage all email communications in one place"
  },
  {
    icon: MessageCircle,
    name: "Live Chat",
    description: "Real-time customer conversations on your website"
  },
  {
    icon: MessageSquare,
    name: "WhatsApp",
    description: "Business messaging through WhatsApp"
  }
];

const pricingTiers = [
  {
    name: "Starter",
    price: 49,
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 3 team members",
      "1,000 conversations/month",
      "Basic AI responses",
      "Email + Chat support",
      "5 saved templates"
    ]
  },
  {
    name: "Growth",
    price: 99,
    description: "For growing teams with advanced needs",
    features: [
      "Up to 10 team members",
      "5,000 conversations/month",
      "Advanced AI capabilities",
      "Priority support",
      "Unlimited templates",
      "Custom workflows"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 249,
    description: "For large organizations requiring full control",
    features: [
      "Unlimited team members",
      "Unlimited conversations",
      "Custom AI training",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantees"
    ]
  }
];

const testimonials = [
  {
    quote: "GetSolvd's AI handles most of our tickets automatically with incredible accuracy. The few that need human review come with smart suggestions that make resolution quick and easy.",
    author: "Sarah Chen", 
    role: "Head of Customer Success",

  },
  {
    quote: "With the Shopify integration, our support has been flawless. Customer response times dropped 75% and satisfaction is through the roof - it's even boosting our sales numbers!",
    author: "Michael Rodriguez",
    role: "E-commerce Manager",
  },
  {
    quote: "The multi-channel support is a game-changer. Managing Instagram, email, and chat all in one place is incredibly efficient. No more switching between apps to respond to customers!",
    author: "Emily Watson",
    role: "Support Lead",
  }
];
</script>

<div class="min-h-screen">
  <header class="absolute top-0 left-0 w-full z-50 py-6">
    <div class="container mx-auto px-6 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-white">GetSolvd</a>
      
      <nav class="hidden md:flex items-center space-x-8">
        <a href="#ai-first" class="text-white hover:text-gray-200 transition-colors relative group">
          <span class="group-hover:border group-hover:border-white/50 px-3 py-1 rounded-full transition-all">AI-First</span>
        </a>
        <a href="#integrations" class="text-white hover:text-gray-200 transition-colors relative group">
          <span class="group-hover:border group-hover:border-white/50 px-3 py-1 rounded-full transition-all">Integrations</span>
        </a>
        <a href="#pricing" class="text-white hover:text-gray-200 transition-colors relative group">
          <span class="group-hover:border group-hover:border-white/50 px-3 py-1 rounded-full transition-all">Pricing</span>
        </a>
      </nav>

      <div class="hidden md:flex items-center space-x-4">
        <a href="/login" class="text-white hover:text-gray-200 transition-colors">Login</a>
        <a
          href="/demo"
          class="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Book a Demo
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="min-h-screen flex items-center bg-gradient-to-b from-green-600 to-gray-100 text-white">
    <div class="container mx-auto px-6 py-24">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div in:fly="{{ y: 50, duration: 1000 }}" class="space-y-8">
          <h1 class="text-5xl md:text-6xl font-bold leading-tight">
            AI-First Customer Support 
          </h1>
          <p class="text-xl text-gray-100">
            Beyond Tickets, Beyond Bots: <br> Real Intelligence for Real Customer Service
          </p>
          <div class="space-x-4">
            <a
              href="/app"
              class="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/demo"
              class="inline-block px-8 py-4 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all"
            >
              Book a Demo
            </a>
          </div>
        </div>
        <div in:fly="{{ y: 50, duration: 1000, delay: 200 }}" class="relative">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-b from-green-600/30 to-white/30 rounded-lg backdrop-blur-sm"></div>
            <img
              src="images/dashboard.png"
              alt="Dashboard Preview"
              class="rounded-lg shadow-2xl relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- AI Capabilities Section -->
  <section id="ai-first" class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">We'll take care of most of it</h2>
        <p class="text-xl text-gray-600">AI-powered support for your customers</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <h3 class="text-3xl font-bold text-gray-900">Intelligent Support Automation</h3>
          <p class="text-lg text-gray-600">
            Our AI engine handles over 70% of customer inquiries without human interaction, from processing returns to updating account information. By learning from your team's best responses, it automatically suggests relevant solutions and streamlines customer service operations.
          </p>
          <ul class="space-y-4">
            <li class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Automated returns and refund processing</span>
            </li>
            <li class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Self-service account management</span>
            </li>
            <li class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Smart response suggestions</span>
            </li>
            <li class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700">Intelligent ticket routing and prioritization</span>
            </li>
          </ul>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <CustomArc
            value={metrics.aiHandling}
            title="Faster Resolution"
            gradientFrom="indigo-400"
            gradientTo="indigo-600"
          />
          <CustomArc
            value={metrics.responseTime}
            title="Response Rate"
            gradientFrom="green-400"
            gradientTo="green-600"
          />
          <CustomArc
            value={metrics.satisfaction}
            title="Customer Satisfaction"
            gradientFrom="blue-400"
            gradientTo="blue-600"
          />
          <CustomArc
            value={metrics.resolution}
            title="First Contact Resolution"
            gradientFrom="purple-400"
            gradientTo="purple-600"
          />
        </div>
      </div>
    </div>
  </section>

  <!-- Problem Resolution Section -->
  <section class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">When Problems Need Human Touch</h2>
        <p class="text-xl text-gray-600">Our intuitive interface empowers your team to handle complex issues efficiently</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <GradientSection>
          <div class="space-y-6">
            <h3 class="text-2xl font-bold text-white">Seamless Escalation Process</h3>
            <p class="text-gray-100">
              When AI detects a complex issue requiring human expertise, cases are automatically routed to the most qualified team member, complete with full context and conversation history.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Smart agent routing based on expertise</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Complete conversation history and context</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Real-time collaboration tools</span>
              </li>
            </ul>
          </div>
        </GradientSection>

        <GradientSection>
          <div class="space-y-6">
            <h3 class="text-2xl font-bold text-white">Powerful Resolution Tools</h3>
            <p class="text-gray-100">
              Our comprehensive toolkit gives your team everything they need to resolve complex issues quickly and effectively, while maintaining a personal touch.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Advanced case management</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Internal knowledge base integration</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-100">Custom workflow automation</span>
              </li>
            </ul>
          </div>
        </GradientSection>
      </div>
    </div>
  </section>

  <!-- Channel Integration Section -->
  <section id="integrations" class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Multi-Channel Support</h2>
        <p class="text-xl text-gray-600">All your customer conversations in one place</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each channels as channel}
          <div class="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svelte:component this={channel.icon} class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold mb-4">{channel.name}</h3>
            <p class="text-gray-600">{channel.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
        <p class="text-xl text-gray-600">Everything you need to deliver exceptional customer support</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        {#each features as feature}
          <GradientSection>
            <div class="flex flex-col items-start">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svelte:component this={feature.icon} class="w-6 h-6 text-green-600" />
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p class="text-gray-100">{feature.description}</p>
            </div>
          </GradientSection>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
        <p class="text-xl text-gray-600">Choose the plan that's right for your team</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each pricingTiers as tier}
          <div class="relative p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow {tier.popular ? 'border-2 border-green-500' : ''}">
            {#if tier.popular}
              <div class="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span class="inline-block px-3 py-1 text-sm text-white bg-green-500 rounded-full">Most Popular</span>
              </div>
            {/if}
            <h3 class="text-2xl font-bold mb-2">{tier.name}</h3>
            <div class="mb-4">
              <span class="text-4xl font-bold">${tier.price}</span>
              <span class="text-gray-600">/month</span>
            </div>
            <p class="text-gray-600 mb-6">{tier.description}</p>
            <ul class="space-y-4 mb-8">
              {#each tier.features as feature}
                <li class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-gray-700">{feature}</span>
                </li>
              {/each}
            </ul>
            <a
              href="/signup"
              class="block w-full px-4 py-3 text-center font-semibold rounded-lg {tier.popular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors"
            >
              Get Started
            </a>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section class="py-20 bg-gray-100">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Loved by Support Teams</h2>
        <p class="text-xl text-gray-600">See what our customers have to say</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each testimonials as testimonial}
          <div class="p-8 bg-white rounded-xl shadow-lg">
            <svg class="w-8 h-8 text-green-500 mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p class="text-gray-600 mb-6">{testimonial.quote}</p>
            <div>
              <p class="font-semibold text-gray-900">{testimonial.author}</p>
              <p class="text-sm text-gray-600">{testimonial.role}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  <!-- CTA Section -->
  <section class="py-20 bg-gradient-to-t from-green-600 to-gray-100 text-gray-800">
    <div class="container mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6 text-center md:text-left">
          <h2 class="text-4xl font-bold">About GetSolvd</h2>
          <p class="text-lg text-gray-800 max-w-lg mx-auto md:mx-0">
             GetSolvd helps get rid of the hassle of customer support. Quick resolutions, happy customers and hundreds of hours saved.
          </p>
          <div class="space-y-2">
            <p class="text-lg text-gray-800">
              <span class="font-semibold">Email:</span> <a href="mailto:info@getsolvd.xyz" class="hover:text-gray-600">info@getsolvd.xyz</a>
            </p>
          </div>
        </div>

        <div class="text-center md:text-left space-y-6">
          <h2 class="text-4xl font-bold">Ready to Transform Your <br> Customer Support?</h2>
          <p class="text-xl text-gray-800 max-w-lg mx-auto md:mx-0">
            Join the hundreds of Shopify stores that have already made the switch.
          </p>
          <div class="space-x-4">
            <a
              href="/app"
              class="inline-block px-8 py-4 bg-white text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="/demo"
              class="inline-block px-8 py-4 border-2 border-gray-800 rounded-lg font-semibold hover:bg-gray-800 hover:text-white transition-all"
            >
              Book a Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style lang="postcss">
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(*) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :global(*::-webkit-scrollbar) {
    display: none;
  }
</style> 