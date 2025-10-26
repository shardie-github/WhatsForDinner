import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../src/components/Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['elevated', 'outlined', 'filled', 'brand'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Elevated: Story = {
  args: {
    children: 'This is an elevated card with some content.',
    variant: 'elevated',
  },
};

export const Outlined: Story = {
  args: {
    children: 'This is an outlined card with some content.',
    variant: 'outlined',
  },
};

export const Filled: Story = {
  args: {
    children: 'This is a filled card with some content.',
    variant: 'filled',
  },
};

export const Brand: Story = {
  args: {
    children: 'This is a brand card with some content.',
    variant: 'brand',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This card has a title and some content.',
    variant: 'elevated',
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle',
    children: 'This card has both a title and subtitle with some content.',
    variant: 'elevated',
  },
};