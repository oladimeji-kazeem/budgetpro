from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Allows dictionary lookup by key in Django templates."""
    if isinstance(dictionary, dict):
        return dictionary.get(key)
    return None