export function createTaskCard(item, index = 0) {
  const article = document.createElement('article');
  article.className = `task-card ${item.priority.className}${index === 0 ? ' is-featured' : ''}`;
  article.dataset.taskId = item.task.id;

  const meta = document.createElement('div');
  meta.className = 'task-top';
  meta.append(
    pill(item.priority.label, 'priority-pill'),
    pill(`${item.task.duration} min`, 'task-pill'),
    pill(item.task.difficulty, 'task-pill')
  );

  const title = document.createElement('h3');
  title.textContent = item.task.title;

  const reason = document.createElement('p');
  reason.className = 'task-reason';
  reason.textContent = item.reason;

  const more = document.createElement('details');
  more.className = 'task-more';

  const moreSummary = document.createElement('summary');
  moreSummary.textContent = 'Details';

  const details = document.createElement('dl');
  details.className = 'task-details';
  details.append(
    detailBlock('Aufgabe', item.task.description),
    detailBlock('Priorität', item.priority.meaning),
    detailBlock('Werkzeug', item.task.tools.join(', '))
  );
  more.append(moreSummary, details);

  const content = document.createElement('div');
  content.className = 'task-content';
  if (index === 0) {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'task-eyebrow';
    eyebrow.textContent = 'Jetzt zuerst';
    content.append(eyebrow);
  }

  content.append(meta, title, reason, more);

  const action = document.createElement('div');
  action.className = 'task-action';

  const doneButton = document.createElement('button');
  doneButton.className = 'task-done';
  doneButton.type = 'button';
  doneButton.setAttribute('aria-pressed', 'false');

  const doneIcon = document.createElement('span');
  doneIcon.setAttribute('aria-hidden', 'true');
  doneIcon.textContent = '✓';

  const doneLabel = document.createElement('span');
  doneLabel.textContent = 'Erledigt markieren';

  doneButton.append(doneIcon, doneLabel);
  doneButton.addEventListener('click', () => {
    const isDone = article.classList.toggle('is-done');
    doneButton.setAttribute('aria-pressed', String(isDone));
    doneLabel.textContent = isDone ? 'Erledigt' : 'Erledigt markieren';
    more.open = !isDone && more.open;
    article.dispatchEvent(new CustomEvent('taskdone', {
      bubbles: true,
      detail: { isDone, taskId: item.task.id }
    }));
  });

  action.append(doneButton);
  article.append(content, action);
  return article;
}

function pill(text, className) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function detailBlock(term, description) {
  const wrapper = document.createElement('div');
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = term;
  dd.textContent = description;
  wrapper.append(dt, dd);
  return wrapper;
}
