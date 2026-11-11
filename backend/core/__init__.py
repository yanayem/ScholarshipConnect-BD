import django.template.context

# Patch Django 3.2 Context.__copy__ for compatibility with Python 3.14+
def _patch_django_context_copy():
    try:
        def __copy__(self):
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            duplicate.dicts = self.dicts[:]
            return duplicate

        django.template.context.BaseContext.__copy__ = __copy__
    except:
        pass

_patch_django_context_copy()
