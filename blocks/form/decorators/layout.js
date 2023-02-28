function createSection(fields, groupName, form) {
  const section = document.createElement('div');
  section.className = groupName;
  section.append(...form.querySelectorAll(fields));
  return section;
}
export default function decorateLayout(form, groups) {
  const sections = Object
    .entries(groups)
    .map(([groupName, group]) => createSection(group, groupName, form));

  form.append(...sections);
}
