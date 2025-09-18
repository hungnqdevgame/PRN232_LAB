using Covid_API.Models;
using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;
using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var ODataConventionModel = new ODataConventionModelBuilder();

ODataConventionModel.EntitySet<Case>("Cases");
ODataConventionModel.EntitySet<Region>("Regions");

var edmModel = ODataConventionModel.GetEdmModel();

// CORS: Cho phép mọi origin (hoặc chỉnh sửa cho domain frontend)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<PRN232Context>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddControllers().AddOData(
    options => options.Select().Filter().OrderBy().Expand().Count().SetMaxTop(64000).AddRouteComponents(
        "odata",
        edmModel));

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ODataASPNetCoreDemo", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ODataASPNetCoreDemo v1");
        c.RoutePrefix = string.Empty; // Truy cập swagger tại đường dẫn gốc
    });
}

app.UseCors();

app.UseHttpsRedirection();

app.UseRouting();

app.MapControllers();

app.UseAuthorization();

app.Run();
