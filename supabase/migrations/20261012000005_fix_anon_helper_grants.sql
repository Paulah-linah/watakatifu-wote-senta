-- Public read policies evaluate can_manage() for anonymous visitors too.
-- The helpers only ever return false/null without a signed-in staff member, so anon may execute them.
grant execute on function public.current_staff_role(), public.is_staff(), public.can_manage(text),
  public.inquiry_visible(public.inquiry_type) to anon;
