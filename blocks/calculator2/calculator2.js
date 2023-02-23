import { readBlockConfig } from '../../scripts/scripts.js';
import {
  heading, disclaimer,
} from './fields.js';

import repaymentsCalculator from './repaymentsCalculator.js';

export default function decorate(block) {
  const config = readBlockConfig(block);
  let form;
  if (config.id.trim() === 'repayments-calculator') {
    form = repaymentsCalculator(block, config);
  }
  block.replaceChildren(heading(config.heading), form, disclaimer(config.disclaimer));
}
